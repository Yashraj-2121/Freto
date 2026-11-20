namespace Freto.RouteOptimizer.Models;

public class LocationPoint
{
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double DemandWeightTons { get; set; } = 0.0;
    public string? ContactPerson { get; set; }
    public string? Notes { get; set; }
    public int StopOrder { get; set; } = 0;
}
