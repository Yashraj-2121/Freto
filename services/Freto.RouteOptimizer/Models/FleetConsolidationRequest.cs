namespace Freto.RouteOptimizer.Models;

public class ShipmentOrder
{
    public string OrderId { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public string Title { get; set; } = string.Empty;
    public string OriginCity { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;
    public double WeightTons { get; set; } = 1.0;
    public double VolumeCbm { get; set; } = 5.0;
    public double OfferPriceInr { get; set; } = 0.0;
}

public class FleetConsolidationRequest
{
    public string HubCity { get; set; } = "Mumbai";
    public List<TruckSpecification> AvailableTrucks { get; set; } = new();
    public List<ShipmentOrder> Shipments { get; set; } = new();
}
