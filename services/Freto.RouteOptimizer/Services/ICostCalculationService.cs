using Freto.RouteOptimizer.Models;

namespace Freto.RouteOptimizer.Services;

public interface ICostCalculationService
{
    IReadOnlyList<TruckSpecification> GetAllTruckTypes();
    TruckSpecification GetTruckSpecification(string? truckType);
    CostSummary ComputeCost(double totalDistanceKm, TruckSpecification truck, double payloadWeightTons, string strategy);
}
