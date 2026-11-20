using Freto.RouteOptimizer.Models;

namespace Freto.RouteOptimizer.Services;

public class RouteOptimizerService : IRouteOptimizerService
{
    private readonly ICityRegistry _cityRegistry;
    private readonly ICostCalculationService _costCalculator;

    public RouteOptimizerService(ICityRegistry cityRegistry, ICostCalculationService costCalculator)
    {
        _cityRegistry = cityRegistry;
        _costCalculator = costCalculator;
    }

    public OptimizationResult OptimizeRoute(OptimizationRequest request)
    {
        var origin = _cityRegistry.ResolveLocation(request.Origin);
        var stops = request.Stops.Select(s => _cityRegistry.ResolveLocation(s)).ToList();

        LocationPoint? destination = null;
        if (request.IsRoundTrip)
        {
            destination = new LocationPoint
            {
                Name = origin.Name + " (Return Hub)",
                Latitude = origin.Latitude,
                Longitude = origin.Longitude,
                Notes = "Round-trip return to base depot"
            };
        }
        else if (request.Destination != null && !string.IsNullOrWhiteSpace(request.Destination.Name))
        {
            destination = _cityRegistry.ResolveLocation(request.Destination);
        }

        var truck = _costCalculator.GetTruckSpecification(request.TruckType);
        string strategy = string.IsNullOrWhiteSpace(request.Strategy) ? "Balanced" : request.Strategy;

        // 1. Calculate unoptimized original baseline
        var unoptimizedSequence = BuildFullSequence(origin, stops, destination);
        double originalDistance = ComputeTotalDistance(unoptimizedSequence);
        var originalCostSummary = _costCalculator.ComputeCost(originalDistance, truck, request.TotalWeightTons, strategy);

        // 2. Run optimization on intermediate stops
        List<LocationPoint> optimizedStops;
        string algorithmUsed;

        if (stops.Count <= 1)
        {
            optimizedStops = new List<LocationPoint>(stops);
            algorithmUsed = "Direct Route (No intermediate sequencing required)";
        }
        else if (stops.Count <= 8)
        {
            optimizedStops = SolveExactPermutations(origin, stops, destination);
            algorithmUsed = $"Branch-and-Bound Exact Permutation TSP (tested {Factorial(stops.Count)} tours)";
        }
        else
        {
            optimizedStops = SolveTwoOptLocalSearch(origin, stops, destination);
            algorithmUsed = "Nearest Neighbor Greedy + 2-Opt Iterative Edge Swap (Large Tour)";
        }

        // 3. Build optimized sequence and legs
        var optimizedSequence = BuildFullSequence(origin, optimizedStops, destination);
        for (int i = 0; i < optimizedSequence.Count; i++)
        {
            optimizedSequence[i].StopOrder = i;
        }

        double optimizedDistance = ComputeTotalDistance(optimizedSequence);
        var optimizedCostSummary = _costCalculator.ComputeCost(optimizedDistance, truck, request.TotalWeightTons, strategy);

        // Build Route Legs
        var legs = new List<RouteLeg>();
        double cumulativeDist = 0.0;
        double currentPayload = request.TotalWeightTons;

        for (int i = 0; i < optimizedSequence.Count - 1; i++)
        {
            var from = optimizedSequence[i];
            var to = optimizedSequence[i + 1];
            double legDist = _cityRegistry.GetDistanceKm(from, to);
            cumulativeDist += legDist;

            double speed = Math.Max(30.0, truck.AverageSpeedKmh);
            double legHours = Math.Round(legDist / speed, 1);
            var legCost = _costCalculator.ComputeCost(legDist, truck, currentPayload, strategy);

            // Deduct drop weight if waypoint had a demand
            if (to.DemandWeightTons > 0)
            {
                currentPayload = Math.Max(0.5, currentPayload - to.DemandWeightTons);
            }

            legs.Add(new RouteLeg
            {
                LegIndex = i + 1,
                From = from,
                To = to,
                DistanceKm = legDist,
                EstimatedHours = legHours,
                FuelCost = legCost.EstimatedFuelCost,
                TollCost = legCost.EstimatedTolls,
                CumulativeDistanceKm = Math.Round(cumulativeDist, 1),
                CurrentPayloadTons = Math.Round(currentPayload, 2)
            });
        }

        double totalHours = Math.Round(legs.Sum(l => l.EstimatedHours), 1);
        double distSaved = Math.Max(0.0, Math.Round(originalDistance - optimizedDistance, 1));
        double pctSaved = originalDistance > 0 ? Math.Round((distSaved / originalDistance) * 100.0, 1) : 0.0;
        double costSaved = Math.Max(0.0, Math.Round(originalCostSummary.TotalEstimatedCost - optimizedCostSummary.TotalEstimatedCost));
        double co2Saved = Math.Max(0.0, Math.Round(originalCostSummary.Co2EmissionsKg - optimizedCostSummary.Co2EmissionsKg, 1));
        double hoursSaved = Math.Max(0.0, Math.Round((originalDistance / truck.AverageSpeedKmh) - totalHours, 1));

        return new OptimizationResult
        {
            Engine = ".NET 10 High-Performance C# Route Optimizer",
            Algorithm = algorithmUsed,
            Strategy = strategy,
            TruckSpecification = truck,
            TotalDistanceKm = optimizedDistance,
            TotalDrivingHours = totalHours,
            CostSummary = optimizedCostSummary,
            Savings = new ComparisonStats
            {
                OriginalDistanceKm = originalDistance,
                OptimizedDistanceKm = optimizedDistance,
                DistanceSavedKm = distSaved,
                PercentageDistanceSaved = pctSaved,
                CostSavedInr = costSaved,
                HoursSaved = hoursSaved,
                Co2SavedKg = co2Saved
            },
            Legs = legs,
            OrderedWaypoints = optimizedSequence,
            ProcessedAtUtc = DateTime.UtcNow
        };
    }

    public FleetConsolidationResult ConsolidateFleet(FleetConsolidationRequest request)
    {
        var hub = _cityRegistry.FindCity(request.HubCity) ?? new LocationPoint { Name = request.HubCity, Latitude = 19.0760, Longitude = 72.8777 };

        var trucks = request.AvailableTrucks.Count > 0
            ? request.AvailableTrucks
            : new List<TruckSpecification>
            {
                _costCalculator.GetTruckSpecification("14ft Open Body (3-4 Ton)"),
                _costCalculator.GetTruckSpecification("19ft Container (7-8 Ton)"),
                _costCalculator.GetTruckSpecification("24ft Multi-Axle (10-12 Ton)")
            };

        var sortedShipments = request.Shipments
            .OrderByDescending(s => s.WeightTons)
            .ToList();

        var plans = new List<ConsolidatedTruckPlan>();
        var unassigned = new List<ShipmentOrder>();

        int truckIndex = 1;
        foreach (var truck in trucks)
        {
            var plan = new ConsolidatedTruckPlan
            {
                TruckId = $"TRK-C#{truckIndex++:D2}",
                Truck = truck,
                AssignedShipments = new List<ShipmentOrder>()
            };

            double remainingCapacity = truck.CapacityTons;

            for (int i = sortedShipments.Count - 1; i >= 0; i--)
            {
                var s = sortedShipments[i];
                if (s.WeightTons <= remainingCapacity)
                {
                    plan.AssignedShipments.Add(s);
                    remainingCapacity -= s.WeightTons;
                    sortedShipments.RemoveAt(i);
                }
            }

            if (plan.AssignedShipments.Count > 0)
            {
                plan.TotalAssignedWeightTons = Math.Round(plan.AssignedShipments.Sum(s => s.WeightTons), 2);
                plan.WeightUtilizationPercent = Math.Round((plan.TotalAssignedWeightTons / truck.CapacityTons) * 100.0, 1);
                plan.TotalEstimatedRevenueInr = Math.Round(plan.AssignedShipments.Sum(s => s.OfferPriceInr));

                // Optimize route for the consolidated shipments
                var stops = plan.AssignedShipments.Select(s => new LocationPoint
                {
                    Name = s.DestinationCity,
                    DemandWeightTons = s.WeightTons,
                    Notes = $"Delivery: {s.Title} ({s.WeightTons}T)"
                }).ToList();

                var optReq = new OptimizationRequest
                {
                    Origin = hub,
                    Stops = stops,
                    IsRoundTrip = true,
                    TruckType = truck.TruckType,
                    TotalWeightTons = plan.TotalAssignedWeightTons,
                    Strategy = "Balanced"
                };

                plan.OptimizedRoute = OptimizeRoute(optReq);
                plan.TotalEstimatedCostInr = plan.OptimizedRoute.CostSummary.TotalEstimatedCost;
                plan.ProjectedProfitInr = Math.Round(plan.TotalEstimatedRevenueInr - plan.TotalEstimatedCostInr);

                plans.Add(plan);
            }
        }

        unassigned.AddRange(sortedShipments);

        double totalRevenue = Math.Round(plans.Sum(p => p.TotalEstimatedRevenueInr));
        double totalCost = Math.Round(plans.Sum(p => p.TotalEstimatedCostInr));
        double netProfit = Math.Round(totalRevenue - totalCost);
        double avgUtilization = plans.Count > 0 ? Math.Round(plans.Average(p => p.WeightUtilizationPercent), 1) : 0.0;

        return new FleetConsolidationResult
        {
            Engine = "C# .NET Fleet Consolidation Engine (Bin-Packing & VRP)",
            TotalShipments = request.Shipments.Count,
            ConsolidatedTrucksCount = plans.Count,
            AverageFleetUtilizationPercent = avgUtilization,
            TotalProjectedRevenueInr = totalRevenue,
            TotalProjectedCostInr = totalCost,
            TotalNetProfitInr = netProfit,
            TruckPlans = plans,
            UnassignedShipments = unassigned
        };
    }

    #region Helper & TSP Optimization Algorithms

    private List<LocationPoint> BuildFullSequence(LocationPoint origin, List<LocationPoint> stops, LocationPoint? destination)
    {
        var seq = new List<LocationPoint> { origin };
        seq.AddRange(stops);
        if (destination != null)
        {
            seq.Add(destination);
        }
        return seq;
    }

    private double ComputeTotalDistance(List<LocationPoint> sequence)
    {
        double sum = 0.0;
        for (int i = 0; i < sequence.Count - 1; i++)
        {
            sum += _cityRegistry.GetDistanceKm(sequence[i], sequence[i + 1]);
        }
        return Math.Round(sum, 1);
    }

    private List<LocationPoint> SolveExactPermutations(LocationPoint origin, List<LocationPoint> stops, LocationPoint? destination)
    {
        var bestPermutation = new List<LocationPoint>(stops);
        double minDistance = double.MaxValue;

        var indices = Enumerable.Range(0, stops.Count).ToArray();
        foreach (var perm in GetPermutations(indices, indices.Length))
        {
            var candidateStops = perm.Select(i => stops[i]).ToList();
            var candidateSeq = BuildFullSequence(origin, candidateStops, destination);
            double dist = ComputeTotalDistance(candidateSeq);

            if (dist < minDistance)
            {
                minDistance = dist;
                bestPermutation = candidateStops;
            }
        }

        return bestPermutation;
    }

    private List<LocationPoint> SolveTwoOptLocalSearch(LocationPoint origin, List<LocationPoint> stops, LocationPoint? destination)
    {
        // 1. Initial solution: Nearest-Neighbor greedy heuristic
        var unvisited = new List<LocationPoint>(stops);
        var current = origin;
        var tour = new List<LocationPoint>();

        while (unvisited.Count > 0)
        {
            var nearest = unvisited
                .OrderBy(s => _cityRegistry.GetDistanceKm(current, s))
                .First();

            tour.Add(nearest);
            unvisited.Remove(nearest);
            current = nearest;
        }

        // 2. Iterative 2-Opt edge swaps
        bool improved = true;
        int maxIterations = 500;
        int iter = 0;

        while (improved && iter++ < maxIterations)
        {
            improved = false;
            for (int i = 0; i < tour.Count - 1; i++)
            {
                for (int k = i + 1; k < tour.Count; k++)
                {
                    double currentDist = ComputeTotalDistance(BuildFullSequence(origin, tour, destination));

                    // Reverse subsegment from i to k
                    var candidate = TwoOptSwap(tour, i, k);
                    double newDist = ComputeTotalDistance(BuildFullSequence(origin, candidate, destination));

                    if (newDist < currentDist - 0.1)
                    {
                        tour = candidate;
                        improved = true;
                        break;
                    }
                }
                if (improved) break;
            }
        }

        return tour;
    }

    private static List<LocationPoint> TwoOptSwap(List<LocationPoint> route, int i, int k)
    {
        var newRoute = new List<LocationPoint>();
        for (int c = 0; c < i; c++) newRoute.Add(route[c]);
        for (int c = k; c >= i; c--) newRoute.Add(route[c]);
        for (int c = k + 1; c < route.Count; c++) newRoute.Add(route[c]);
        return newRoute;
    }

    private static IEnumerable<int[]> GetPermutations(int[] array, int length)
    {
        if (length == 1)
        {
            yield return (int[])array.Clone();
            yield break;
        }

        for (int i = 0; i < length; i++)
        {
            foreach (var perm in GetPermutations(array, length - 1))
            {
                yield return perm;
            }

            int swapIndex = (length % 2 == 1) ? 0 : i;
            (array[swapIndex], array[length - 1]) = (array[length - 1], array[swapIndex]);
        }
    }

    private static long Factorial(int n)
    {
        long f = 1;
        for (int i = 2; i <= n; i++) f *= i;
        return f;
    }

    #endregion
}
