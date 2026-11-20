using Freto.RouteOptimizer.Models;

namespace Freto.RouteOptimizer.Services;

public class CostCalculationService : ICostCalculationService
{
    private static readonly Dictionary<string, TruckSpecification> Catalog = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Mini Truck / Tata Ace (1-2 Ton)"] = new()
        {
            TruckType = "Mini Truck / Tata Ace (1-2 Ton)",
            CapacityTons = 2.0,
            RatePerKm = 22.0,
            BaseFare = 1500.0,
            BaseFuelConsumptionLitersPer100Km = 10.0,
            AverageSpeedKmh = 42.0,
            TollRatePerKm = 1.2
        },
        ["14ft Open Body (3-4 Ton)"] = new()
        {
            TruckType = "14ft Open Body (3-4 Ton)",
            CapacityTons = 4.0,
            RatePerKm = 34.0,
            BaseFare = 3000.0,
            BaseFuelConsumptionLitersPer100Km = 18.0,
            AverageSpeedKmh = 45.0,
            TollRatePerKm = 1.8
        },
        ["19ft Container (7-8 Ton)"] = new()
        {
            TruckType = "19ft Container (7-8 Ton)",
            CapacityTons = 8.0,
            RatePerKm = 46.0,
            BaseFare = 5500.0,
            BaseFuelConsumptionLitersPer100Km = 24.0,
            AverageSpeedKmh = 48.0,
            TollRatePerKm = 2.4
        },
        ["24ft Multi-Axle (10-12 Ton)"] = new()
        {
            TruckType = "24ft Multi-Axle (10-12 Ton)",
            CapacityTons = 12.0,
            RatePerKm = 58.0,
            BaseFare = 7500.0,
            BaseFuelConsumptionLitersPer100Km = 28.0,
            AverageSpeedKmh = 50.0,
            TollRatePerKm = 2.9
        },
        ["32ft Multi-Axle (15-20 Ton)"] = new()
        {
            TruckType = "32ft Multi-Axle (15-20 Ton)",
            CapacityTons = 20.0,
            RatePerKm = 72.0,
            BaseFare = 10000.0,
            BaseFuelConsumptionLitersPer100Km = 34.0,
            AverageSpeedKmh = 52.0,
            TollRatePerKm = 3.6
        },
        ["Refrigerated Container (5-10 Ton)"] = new()
        {
            TruckType = "Refrigerated Container (5-10 Ton)",
            CapacityTons = 10.0,
            RatePerKm = 65.0,
            BaseFare = 9000.0,
            BaseFuelConsumptionLitersPer100Km = 32.0,
            AverageSpeedKmh = 48.0,
            TollRatePerKm = 2.8
        },
        ["Flatbed Trailer (25+ Ton)"] = new()
        {
            TruckType = "Flatbed Trailer (25+ Ton)",
            CapacityTons = 35.0,
            RatePerKm = 95.0,
            BaseFare = 14000.0,
            BaseFuelConsumptionLitersPer100Km = 42.0,
            AverageSpeedKmh = 46.0,
            TollRatePerKm = 4.2
        }
    };

    public IReadOnlyList<TruckSpecification> GetAllTruckTypes() => Catalog.Values.ToList();

    public TruckSpecification GetTruckSpecification(string? truckType)
    {
        if (!string.IsNullOrWhiteSpace(truckType) && Catalog.TryGetValue(truckType, out var spec))
        {
            return spec;
        }

        return Catalog["14ft Open Body (3-4 Ton)"];
    }

    public CostSummary ComputeCost(double totalDistanceKm, TruckSpecification truck, double payloadWeightTons, string strategy)
    {
        double weight = Math.Max(0.5, payloadWeightTons);
        double maxTons = Math.Max(1.0, truck.CapacityTons);
        double weightMultiplier = Math.Max(1.0, weight / (maxTons * 0.75));

        // Adjust based on strategy
        double strategyRateModifier = strategy switch
        {
            "Cheapest" => 0.95, // avoids high-cost dynamic routing
            "Fastest" => 1.05,  // express corridors with higher tolls
            _ => 1.0            // Balanced
        };

        double tollMultiplier = strategy switch
        {
            "Cheapest" => 0.75, // avoids prime expressways when possible
            "Fastest" => 1.25,  // prioritizes high-speed toll expressways
            _ => 1.0
        };

        double distanceFare = Math.Round(totalDistanceKm * truck.RatePerKm * weightMultiplier * strategyRateModifier);
        double baseFare = truck.BaseFare;

        // Fuel calculation: Diesel consumption with load factor
        double fuelConsumptionPerKm = (truck.BaseFuelConsumptionLitersPer100Km / 100.0) * (1.0 + (weight / maxTons) * 0.25);
        double estimatedFuelLiters = Math.Round(totalDistanceKm * fuelConsumptionPerKm, 1);
        double estimatedFuelCost = Math.Round(estimatedFuelLiters * truck.FuelPricePerLiter);

        // Tolls
        double estimatedTolls = Math.Round(totalDistanceKm * truck.TollRatePerKm * tollMultiplier);

        double subtotal = distanceFare + baseFare;
        double gstAmount = Math.Round(subtotal * 0.05); // 5% GST for Indian Freight Services (SAC 996511)
        double totalEstimatedCost = subtotal + gstAmount;

        // Environmental impact: 2.68 kg CO2 per liter of diesel
        double co2EmissionsKg = Math.Round(estimatedFuelLiters * 2.68, 1);

        return new CostSummary
        {
            BaseFare = baseFare,
            DistanceFare = distanceFare,
            EstimatedFuelCost = estimatedFuelCost,
            EstimatedFuelLiters = estimatedFuelLiters,
            EstimatedTolls = estimatedTolls,
            Subtotal = subtotal,
            GstAmount = gstAmount,
            TotalEstimatedCost = totalEstimatedCost,
            Co2EmissionsKg = co2EmissionsKg
        };
    }
}
