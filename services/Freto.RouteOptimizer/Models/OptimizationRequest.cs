namespace Freto.RouteOptimizer.Models;

public class OptimizationRequest
{
    public LocationPoint Origin { get; set; } = new();
    public List<LocationPoint> Stops { get; set; } = new();
    public LocationPoint? Destination { get; set; }
    public bool IsRoundTrip { get; set; } = false;
    public string? TruckType { get; set; }
    public double TotalWeightTons { get; set; } = 3.5;
    public string Strategy { get; set; } = "Balanced"; // "Fastest", "Cheapest", "Balanced"
}
