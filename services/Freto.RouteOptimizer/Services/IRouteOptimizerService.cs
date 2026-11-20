using Freto.RouteOptimizer.Models;

namespace Freto.RouteOptimizer.Services;

public interface IRouteOptimizerService
{
    OptimizationResult OptimizeRoute(OptimizationRequest request);
    FleetConsolidationResult ConsolidateFleet(FleetConsolidationRequest request);
}
