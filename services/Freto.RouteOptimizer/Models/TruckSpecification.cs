namespace Freto.RouteOptimizer.Models;

public class TruckSpecification
{
    public string TruckType { get; set; } = "14ft Open Body (3-4 Ton)";
    public double CapacityTons { get; set; } = 4.0;
    public double BaseFare { get; set; } = 3000.0;
    public double RatePerKm { get; set; } = 34.0;
    public double BaseFuelConsumptionLitersPer100Km { get; set; } = 22.0;
    public double AverageSpeedKmh { get; set; } = 45.0;
    public double TollRatePerKm { get; set; } = 2.1;
    public double FuelPricePerLiter { get; set; } = 92.0;
}
