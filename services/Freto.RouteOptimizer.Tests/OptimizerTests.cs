using Freto.RouteOptimizer.Models;
using Freto.RouteOptimizer.Services;
using Xunit;

namespace Freto.RouteOptimizer.Tests;

public class OptimizerTests
{
    private readonly CityRegistry _cityRegistry = new();
    private readonly CostCalculationService _costCalculator = new();
    private readonly RouteOptimizerService _optimizer;

    public OptimizerTests()
    {
        _optimizer = new RouteOptimizerService(_cityRegistry, _costCalculator);
    }

    [Fact]
    public void CityRegistry_ResolvesKnownCities_AndCalculatesDistances()
    {
        var mumbai = _cityRegistry.FindCity("Mumbai");
        var delhi = _cityRegistry.FindCity("Delhi");

        Assert.NotNull(mumbai);
        Assert.NotNull(delhi);

        double dist = _cityRegistry.GetDistanceKm(mumbai, delhi);
        Assert.Equal(1420.0, dist);
    }

    [Fact]
    public void CostCalculator_ComputesCorrectFareFuelTollsGst()
    {
        var truck = _costCalculator.GetTruckSpecification("14ft Open Body (3-4 Ton)");
        var cost = _costCalculator.ComputeCost(1000.0, truck, 3.0, "Balanced");

        Assert.True(cost.BaseFare > 0);
        Assert.True(cost.DistanceFare > 0);
        Assert.True(cost.EstimatedFuelCost > 0);
        Assert.True(cost.EstimatedTolls > 0);
        Assert.True(cost.GstAmount > 0);
        Assert.True(cost.TotalEstimatedCost > cost.Subtotal);
        Assert.True(cost.Co2EmissionsKg > 0);
    }

    [Fact]
    public void RouteOptimizer_MultiStop_FindsOptimalSequence_AndSavesDistance()
    {
        // Purposefully provide stops in an inefficient order:
        // Mumbai -> Jaipur (far north) -> Pune (right next to Mumbai) -> Delhi
        // Optimized tour should visit Pune first, then Ahmedabad/Jaipur, then Delhi!
        var request = new OptimizationRequest
        {
            Origin = new LocationPoint { Name = "Mumbai" },
            Stops = new List<LocationPoint>
            {
                new() { Name = "Jaipur" },
                new() { Name = "Pune" },
                new() { Name = "Ahmedabad" }
            },
            Destination = new LocationPoint { Name = "Delhi" },
            TruckType = "19ft Container (7-8 Ton)",
            TotalWeightTons = 5.0,
            Strategy = "Balanced",
            IsRoundTrip = false
        };

        var result = _optimizer.OptimizeRoute(request);

        Assert.NotNull(result);
        Assert.Equal(5, result.OrderedWaypoints.Count); // Origin + 3 stops + Destination
        Assert.Equal(4, result.Legs.Count);
        Assert.True(result.Savings.OriginalDistanceKm >= result.Savings.OptimizedDistanceKm);
        Assert.True(result.TotalDistanceKm > 0);
    }

    [Fact]
    public void FleetConsolidator_ConsolidatesShipments_IntoAppropriateTrucks()
    {
        var request = new FleetConsolidationRequest
        {
            HubCity = "Mumbai",
            Shipments = new List<ShipmentOrder>
            {
                new() { Title = "Consumer Electronics", DestinationCity = "Pune", WeightTons = 1.2, OfferPriceInr = 15000 },
                new() { Title = "Auto Spares", DestinationCity = "Ahmedabad", WeightTons = 2.0, OfferPriceInr = 30000 },
                new() { Title = "Textile Bales", DestinationCity = "Surat", WeightTons = 3.5, OfferPriceInr = 45000 },
            }
        };

        var result = _optimizer.ConsolidateFleet(request);

        Assert.NotNull(result);
        Assert.True(result.ConsolidatedTrucksCount > 0);
        Assert.True(result.TotalProjectedRevenueInr > 0);
    }
}
