namespace Freto.RouteOptimizer.Models;

public class RouteLeg
{
    public int LegIndex { get; set; }
    public LocationPoint From { get; set; } = new();
    public LocationPoint To { get; set; } = new();
    public double DistanceKm { get; set; }
    public double EstimatedHours { get; set; }
    public double FuelCost { get; set; }
    public double TollCost { get; set; }
    public double CumulativeDistanceKm { get; set; }
    public double CurrentPayloadTons { get; set; }
}
