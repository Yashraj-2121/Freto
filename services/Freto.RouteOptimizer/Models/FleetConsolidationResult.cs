namespace Freto.RouteOptimizer.Models;

public class ConsolidatedTruckPlan
{
    public string TruckId { get; set; } = string.Empty;
    public TruckSpecification Truck { get; set; } = new();
    public List<ShipmentOrder> AssignedShipments { get; set; } = new();
    public double TotalAssignedWeightTons { get; set; }
    public double WeightUtilizationPercent { get; set; }
    public double TotalEstimatedRevenueInr { get; set; }
    public double TotalEstimatedCostInr { get; set; }
    public double ProjectedProfitInr { get; set; }
    public OptimizationResult? OptimizedRoute { get; set; }
}

public class FleetConsolidationResult
{
    public string Engine { get; set; } = "C# .NET Fleet Consolidation Engine (Bin-Packing & VRP)";
    public int TotalShipments { get; set; }
    public int ConsolidatedTrucksCount { get; set; }
    public double AverageFleetUtilizationPercent { get; set; }
    public double TotalProjectedRevenueInr { get; set; }
    public double TotalProjectedCostInr { get; set; }
    public double TotalNetProfitInr { get; set; }
    public List<ConsolidatedTruckPlan> TruckPlans { get; set; } = new();
    public List<ShipmentOrder> UnassignedShipments { get; set; } = new();
}
