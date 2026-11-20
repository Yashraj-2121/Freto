using Freto.RouteOptimizer.Models;

namespace Freto.RouteOptimizer.Services;

public interface ICityRegistry
{
    IReadOnlyList<LocationPoint> GetAllCities();
    LocationPoint? FindCity(string name);
    LocationPoint ResolveLocation(LocationPoint input);
    double GetDistanceKm(LocationPoint a, LocationPoint b);
}
