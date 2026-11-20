using Freto.RouteOptimizer.Models;

namespace Freto.RouteOptimizer.Services;

public class CityRegistry : ICityRegistry
{
    private static readonly Dictionary<string, LocationPoint> Cities = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Mumbai"] = new() { Name = "Mumbai", Latitude = 19.0760, Longitude = 72.8777, Notes = "Maharashtra - Financial & Port Hub" },
        ["Delhi"] = new() { Name = "Delhi", Latitude = 28.7041, Longitude = 77.1025, Notes = "NCR - Northern Distribution Core" },
        ["Bengaluru"] = new() { Name = "Bengaluru", Latitude = 12.9716, Longitude = 77.5946, Notes = "Karnataka - Southern Tech & Logistics" },
        ["Chennai"] = new() { Name = "Chennai", Latitude = 13.0827, Longitude = 80.2707, Notes = "Tamil Nadu - Auto Corridor & Port" },
        ["Kolkata"] = new() { Name = "Kolkata", Latitude = 22.5726, Longitude = 88.3639, Notes = "West Bengal - Eastern Gateway" },
        ["Ahmedabad"] = new() { Name = "Ahmedabad", Latitude = 23.0225, Longitude = 72.5714, Notes = "Gujarat - Industrial Corridor" },
        ["Hyderabad"] = new() { Name = "Hyderabad", Latitude = 17.3850, Longitude = 78.4867, Notes = "Telangana - Pharma & Distribution" },
        ["Pune"] = new() { Name = "Pune", Latitude = 18.5204, Longitude = 73.8567, Notes = "Maharashtra - Manufacturing Center" },
        ["Jaipur"] = new() { Name = "Jaipur", Latitude = 26.9124, Longitude = 75.7873, Notes = "Rajasthan - Northern Freight Gateway" },
        ["Surat"] = new() { Name = "Surat", Latitude = 21.1702, Longitude = 72.8311, Notes = "Gujarat - Textile & Diamond Logistics" },
        ["Nagpur"] = new() { Name = "Nagpur", Latitude = 21.1458, Longitude = 79.0882, Notes = "Maharashtra - Central Zero Mile Hub" },
        ["Indore"] = new() { Name = "Indore", Latitude = 22.7196, Longitude = 75.8577, Notes = "Madhya Pradesh - Central Commercial Hub" },
        ["Lucknow"] = new() { Name = "Lucknow", Latitude = 26.8467, Longitude = 80.9462, Notes = "Uttar Pradesh - UP Central Depot" },
        ["Chandigarh"] = new() { Name = "Chandigarh", Latitude = 30.7333, Longitude = 76.7794, Notes = "Punjab / Haryana - Northern Cluster" },
        ["Bhopal"] = new() { Name = "Bhopal", Latitude = 23.2599, Longitude = 77.4126, Notes = "Madhya Pradesh - Central Zone" },
        ["Vadodara"] = new() { Name = "Vadodara", Latitude = 22.3072, Longitude = 73.1812, Notes = "Gujarat - Chemical & Heavy Eng" },
        ["Coimbatore"] = new() { Name = "Coimbatore", Latitude = 11.0168, Longitude = 76.9558, Notes = "Tamil Nadu - Textile & Engineering" },
        ["Kochi"] = new() { Name = "Kochi", Latitude = 9.9312, Longitude = 76.2673, Notes = "Kerala - Deepwater Seaport" },
        ["Visakhapatnam"] = new() { Name = "Visakhapatnam", Latitude = 17.6868, Longitude = 83.2185, Notes = "Andhra Pradesh - Major Port" },
        ["Patna"] = new() { Name = "Patna", Latitude = 25.5941, Longitude = 85.1376, Notes = "Bihar - Eastern Commercial Center" },
        ["Ludhiana"] = new() { Name = "Ludhiana", Latitude = 30.9010, Longitude = 75.8573, Notes = "Punjab - Industrial Hub" },
        ["Varanasi"] = new() { Name = "Varanasi", Latitude = 25.3176, Longitude = 82.9739, Notes = "Uttar Pradesh - Inland Waterway & Rail" },
        ["Guwahati"] = new() { Name = "Guwahati", Latitude = 26.1445, Longitude = 91.7362, Notes = "Assam - North-East Corridor Hub" }
    };

    // Pre-calibrated road distances in km (matching FRETO highway matrices)
    private static readonly Dictionary<string, double> KnownHighwayDistances = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Mumbai-Delhi"] = 1420,
        ["Delhi-Mumbai"] = 1420,
        ["Mumbai-Bengaluru"] = 980,
        ["Bengaluru-Mumbai"] = 980,
        ["Mumbai-Pune"] = 150,
        ["Pune-Mumbai"] = 150,
        ["Mumbai-Ahmedabad"] = 525,
        ["Ahmedabad-Mumbai"] = 525,
        ["Mumbai-Chennai"] = 1340,
        ["Chennai-Mumbai"] = 1340,
        ["Delhi-Bengaluru"] = 2170,
        ["Bengaluru-Delhi"] = 2170,
        ["Delhi-Kolkata"] = 1530,
        ["Kolkata-Delhi"] = 1530,
        ["Delhi-Jaipur"] = 280,
        ["Jaipur-Delhi"] = 280,
        ["Bengaluru-Chennai"] = 350,
        ["Chennai-Bengaluru"] = 350,
        ["Bengaluru-Hyderabad"] = 570,
        ["Hyderabad-Bengaluru"] = 570,
        ["Chennai-Hyderabad"] = 630,
        ["Hyderabad-Chennai"] = 630,
        ["Mumbai-Hyderabad"] = 710,
        ["Hyderabad-Mumbai"] = 710,
        ["Pune-Bengaluru"] = 840,
        ["Bengaluru-Pune"] = 840,
        ["Ahmedabad-Jaipur"] = 670,
        ["Jaipur-Ahmedabad"] = 670,
        ["Nagpur-Mumbai"] = 820,
        ["Mumbai-Nagpur"] = 820,
        ["Nagpur-Delhi"] = 1080,
        ["Delhi-Nagpur"] = 1080,
        ["Indore-Mumbai"] = 585,
        ["Mumbai-Indore"] = 585,
        ["Indore-Delhi"] = 810,
        ["Delhi-Indore"] = 810,
        ["Delhi-Chandigarh"] = 250,
        ["Chandigarh-Delhi"] = 250,
        ["Delhi-Lucknow"] = 550,
        ["Lucknow-Delhi"] = 550
    };

    public IReadOnlyList<LocationPoint> GetAllCities() => Cities.Values.ToList();

    public LocationPoint? FindCity(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return null;
        return Cities.TryGetValue(name.Trim(), out var city) ? city : null;
    }

    public LocationPoint ResolveLocation(LocationPoint input)
    {
        if (Math.Abs(input.Latitude) > 0.001 && Math.Abs(input.Longitude) > 0.001)
        {
            return input;
        }

        var found = FindCity(input.Name);
        if (found != null)
        {
            return new LocationPoint
            {
                Name = found.Name,
                Latitude = found.Latitude,
                Longitude = found.Longitude,
                DemandWeightTons = input.DemandWeightTons,
                ContactPerson = input.ContactPerson,
                Notes = input.Notes ?? found.Notes,
                StopOrder = input.StopOrder
            };
        }

        return input;
    }

    public double GetDistanceKm(LocationPoint a, LocationPoint b)
    {
        if (string.Equals(a.Name, b.Name, StringComparison.OrdinalIgnoreCase))
            return 0.0;

        // Check calibrated highway dictionary
        string key1 = $"{a.Name}-{b.Name}";
        if (KnownHighwayDistances.TryGetValue(key1, out var dist1)) return dist1;

        string key2 = $"{b.Name}-{a.Name}";
        if (KnownHighwayDistances.TryGetValue(key2, out var dist2)) return dist2;

        // Fallback to Haversine with 1.28 road winding tortuosity factor
        var resolvedA = ResolveLocation(a);
        var resolvedB = ResolveLocation(b);

        if (Math.Abs(resolvedA.Latitude) > 0.001 && Math.Abs(resolvedB.Latitude) > 0.001)
        {
            double haversine = ComputeHaversineDistanceKm(resolvedA.Latitude, resolvedA.Longitude, resolvedB.Latitude, resolvedB.Longitude);
            return Math.Round(haversine * 1.28, 1);
        }

        return 450.0; // Default reasonable regional distance
    }

    private static double ComputeHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371.0;
        double dLat = DegreesToRadians(lat2 - lat1);
        double dLon = DegreesToRadians(lon2 - lon1);

        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                   Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return earthRadiusKm * c;
    }

    private static double DegreesToRadians(double deg) => deg * (Math.PI / 180.0);
}
