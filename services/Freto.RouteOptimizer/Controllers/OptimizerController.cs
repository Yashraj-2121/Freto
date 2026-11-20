using Microsoft.AspNetCore.Mvc;
using Freto.RouteOptimizer.Models;
using Freto.RouteOptimizer.Services;

namespace Freto.RouteOptimizer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OptimizerController : ControllerBase
{
    private readonly IRouteOptimizerService _optimizerService;
    private readonly ICityRegistry _cityRegistry;
    private readonly ICostCalculationService _costCalculator;

    public OptimizerController(
        IRouteOptimizerService optimizerService,
        ICityRegistry cityRegistry,
        ICostCalculationService costCalculator)
    {
        _optimizerService = optimizerService;
        _cityRegistry = cityRegistry;
        _costCalculator = costCalculator;
    }

    /// <summary>
    /// Health check and runtime information for the C# Route Optimization Engine.
    /// </summary>
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "online",
            service = "FRETO Route Optimization Engine",
            runtime = ".NET 10.0 (C#)",
            architecture = "High-Performance Logistics TSP & CVRP Microservice",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Returns all registered Indian freight hub cities with geolocations.
    /// </summary>
    [HttpGet("cities")]
    public IActionResult GetCities()
    {
        var cities = _cityRegistry.GetAllCities();
        return Ok(cities);
    }

    /// <summary>
    /// Returns standard freight truck specifications, rate cards, and fuel curves.
    /// </summary>
    [HttpGet("truck-types")]
    public IActionResult GetTruckTypes()
    {
        var types = _costCalculator.GetAllTruckTypes();
        return Ok(types);
    }

    /// <summary>
    /// Optimizes multi-stop route sequence (TSP) to minimize distance, driving hours, fuel, tolls, and CO2 emissions.
    /// </summary>
    [HttpPost("route")]
    public IActionResult OptimizeRoute([FromBody] OptimizationRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Origin.Name))
        {
            return BadRequest(new { message = "Origin depot/city is required." });
        }

        if (request.Stops == null || request.Stops.Count == 0)
        {
            return BadRequest(new { message = "At least one stop waypoint is required for route optimization." });
        }

        try
        {
            var result = _optimizerService.OptimizeRoute(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Optimization calculation failed", error = ex.Message });
        }
    }

    /// <summary>
    /// Solves Capacitated Vehicle Routing (CVRP) to consolidate pending shipments into available trucks.
    /// </summary>
    [HttpPost("consolidate")]
    public IActionResult ConsolidateFleet([FromBody] FleetConsolidationRequest request)
    {
        if (request == null || request.Shipments == null || request.Shipments.Count == 0)
        {
            return BadRequest(new { message = "At least one shipment is required for fleet consolidation." });
        }

        try
        {
            var result = _optimizerService.ConsolidateFleet(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Fleet consolidation failed", error = ex.Message });
        }
    }

    /// <summary>
    /// Returns a pre-configured multi-stop demonstration route to test the engine immediately.
    /// </summary>
    [HttpGet("sample-demo")]
    public IActionResult GetSampleDemo()
    {
        var sampleRequest = new OptimizationRequest
        {
            Origin = new LocationPoint { Name = "Mumbai", DemandWeightTons = 0 },
            Stops = new List<LocationPoint>
            {
                new() { Name = "Jaipur", DemandWeightTons = 1.2, Notes = "North Distribution" },
                new() { Name = "Pune", DemandWeightTons = 0.8, Notes = "Auto Component Depot" },
                new() { Name = "Ahmedabad", DemandWeightTons = 1.5, Notes = "Chemical Delivery" },
                new() { Name = "Indore", DemandWeightTons = 1.0, Notes = "Central Warehouse" }
            },
            Destination = new LocationPoint { Name = "Delhi", DemandWeightTons = 0, Notes = "Final NCR Delivery Hub" },
            TruckType = "24ft Multi-Axle (10-12 Ton)",
            TotalWeightTons = 4.5,
            Strategy = "Balanced",
            IsRoundTrip = false
        };

        var result = _optimizerService.OptimizeRoute(sampleRequest);
        return Ok(new
        {
            request = sampleRequest,
            result
        });
    }
}
