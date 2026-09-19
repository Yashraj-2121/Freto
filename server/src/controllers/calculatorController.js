// Estimated inter-city road distance matrix (in km)
const CITY_DISTANCES = {
  "Mumbai-Delhi": 1420,
  "Delhi-Mumbai": 1420,
  "Mumbai-Bengaluru": 980,
  "Bengaluru-Mumbai": 980,
  "Mumbai-Pune": 150,
  "Pune-Mumbai": 150,
  "Mumbai-Ahmedabad": 525,
  "Ahmedabad-Mumbai": 525,
  "Mumbai-Chennai": 1340,
  "Chennai-Mumbai": 1340,
  "Delhi-Bengaluru": 2170,
  "Bengaluru-Delhi": 2170,
  "Delhi-Kolkata": 1530,
  "Kolkata-Delhi": 1530,
  "Delhi-Jaipur": 280,
  "Jaipur-Delhi": 280,
  "Bengaluru-Chennai": 350,
  "Chennai-Bengaluru": 350,
  "Bengaluru-Hyderabad": 570,
  "Hyderabad-Bengaluru": 570,
  "Chennai-Hyderabad": 630,
  "Hyderabad-Chennai": 630,
  "Mumbai-Hyderabad": 710,
  "Hyderabad-Mumbai": 710,
};

// Rates per km and base pricing by truck category
const TRUCK_RATES = {
  "Mini Truck / Tata Ace (1-2 Ton)": { ratePerKm: 22, baseFare: 1500, maxTons: 2 },
  "14ft Open Body (3-4 Ton)": { ratePerKm: 34, baseFare: 3000, maxTons: 4 },
  "19ft Container (7-8 Ton)": { ratePerKm: 46, baseFare: 5500, maxTons: 8 },
  "24ft Multi-Axle (10-12 Ton)": { ratePerKm: 58, baseFare: 7500, maxTons: 12 },
  "32ft Multi-Axle (15-20 Ton)": { ratePerKm: 72, baseFare: 10000, maxTons: 20 },
  "Refrigerated Container (5-10 Ton)": { ratePerKm: 65, baseFare: 9000, maxTons: 10 },
  "Flatbed Trailer (25+ Ton)": { ratePerKm: 95, baseFare: 14000, maxTons: 35 },
};

export function calculateFreight(req, res) {
  try {
    const { originCity, destinationCity, truckType, weightTons } = req.body;

    if (!originCity || !destinationCity) {
      return res.status(400).json({ message: "Origin and Destination cities are required." });
    }

    const key = `${originCity}-${destinationCity}`;
    const distanceKm = CITY_DISTANCES[key] || 650; // default estimated distance

    const selectedType = TRUCK_RATES[truckType]
      ? truckType
      : "14ft Open Body (3-4 Ton)";
    const config = TRUCK_RATES[selectedType];

    const weight = Number(weightTons) || 2;
    const weightMultiplier = Math.max(1, weight / (config.maxTons * 0.75));

    const distanceFare = Math.round(distanceKm * config.ratePerKm * weightMultiplier);
    const baseFare = config.baseFare;
    const estimatedFuelCost = Math.round(distanceFare * 0.42);
    const estimatedTolls = Math.round(distanceKm * 2.1);
    const subtotal = distanceFare + baseFare;
    const gst5Percent = Math.round(subtotal * 0.05);
    const totalEstimatedFare = subtotal + gst5Percent;

    const transitHours = Math.round(distanceKm / 45); // Avg truck speed 45 km/h

    res.json({
      originCity,
      destinationCity,
      distanceKm,
      truckType: selectedType,
      weightTons: weight,
      estimatedTransitHours: transitHours,
      breakdown: {
        baseFare,
        distanceFare,
        estimatedFuelCost,
        estimatedTolls,
        gstAmount: gst5Percent,
      },
      totalEstimatedFare,
    });
  } catch (error) {
    res.status(500).json({ message: "Calculation failed", error: error.message });
  }
}
