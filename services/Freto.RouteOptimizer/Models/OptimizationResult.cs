namespace Freto.RouteOptimizer.Models;

public class CostSummary
{
    public double BaseFare { get; set; }
    public double DistanceFare { get; set; }
    public double EstimatedFuelCost { get; set; }
    public double EstimatedFuelLiters { get; set; }
    public double EstimatedTolls { get; set; }
    public double Subtotal { get; set; }
    public double GstAmount { get; set; }
    public double TotalEstimatedCost { get; set; }
    public double Co2EmissionsKg { get; set; }
}

public class ComparisonStats
{
    public double OriginalDistanceKm { get; set; }
    public double OptimizedDistanceKm { get; set; }
    public double DistanceSavedKm { get; set; }
    public double PercentageDistanceSaved { get; set; }
    public double CostSavedInr { get; set; }
    public double HoursSaved { get; set; }
    public double Co2SavedKg { get; set; }
}

public class OptimizationResult
{
    public string Engine { get; set; } = "C# .NET 10 High-Performance Logistics Engine";
    public string Algorithm { get; set; } = "Exact Permutation / 2-Opt TSP Optimizer";
    public string Strategy { get; set; } = "Balanced";
    public TruckSpecification TruckSpecification { get; set; } = new();
    public double TotalDistanceKm { get; set; }
    public double TotalDrivingHours { get; set; }
    public CostSummary CostSummary { get; set; } = new();
    public ComparisonStats Savings { get; set; } = new();
    public List<RouteLeg> Legs { get; set; } = new();
    public List<LocationPoint> OrderedWaypoints { get; set; } = new();
    public DateTime ProcessedAtUtc { get; set; } = DateTime.UtcNow;
}
