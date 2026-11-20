// City registry with exact coordinates and calibrated highway distances (matching C# CityRegistry)
export const CITY_COORDINATES = {
  Mumbai: { lat: 19.076, lon: 72.8777, notes: "Maharashtra - Financial & Port Hub" },
  Delhi: { lat: 28.7041, lon: 77.1025, notes: "NCR - Northern Distribution Core" },
  Bengaluru: { lat: 12.9716, lon: 77.5946, notes: "Karnataka - Southern Tech & Logistics" },
  Chennai: { lat: 13.0827, lon: 80.2707, notes: "Tamil Nadu - Auto Corridor & Port" },
  Kolkata: { lat: 22.5726, lon: 88.3639, notes: "West Bengal - Eastern Gateway" },
  Ahmedabad: { lat: 23.0225, lon: 72.5714, notes: "Gujarat - Industrial Corridor" },
  Hyderabad: { lat: 17.385, lon: 78.4867, notes: "Telangana - Pharma & Distribution" },
  Pune: { lat: 18.5204, lon: 73.8567, notes: "Maharashtra - Manufacturing Center" },
  Jaipur: { lat: 26.9124, lon: 75.7873, notes: "Rajasthan - Northern Freight Gateway" },
  Surat: { lat: 21.1702, lon: 72.8311, notes: "Gujarat - Textile & Diamond Logistics" },
  Nagpur: { lat: 21.1458, lon: 79.0882, notes: "Maharashtra - Central Zero Mile Hub" },
  Indore: { lat: 22.7196, lon: 75.8577, notes: "Madhya Pradesh - Central Commercial Hub" },
  Lucknow: { lat: 26.8467, lon: 80.9462, notes: "Uttar Pradesh - UP Central Depot" },
  Chandigarh: { lat: 30.7333, lon: 76.7794, notes: "Punjab / Haryana - Northern Cluster" },
  Bhopal: { lat: 23.2599, lon: 77.4126, notes: "Madhya Pradesh - Central Zone" },
  Vadodara: { lat: 22.3072, lon: 73.1812, notes: "Gujarat - Chemical & Heavy Eng" },
  Coimbatore: { lat: 11.0168, lon: 76.9558, notes: "Tamil Nadu - Textile & Engineering" },
  Kochi: { lat: 9.9312, lon: 76.2673, notes: "Kerala - Deepwater Seaport" },
  Visakhapatnam: { lat: 17.6868, lon: 83.2185, notes: "Andhra Pradesh - Major Port" },
  Patna: { lat: 25.5941, lon: 85.1376, notes: "Bihar - Eastern Commercial Center" },
  Ludhiana: { lat: 30.901, lon: 75.8573, notes: "Punjab - Industrial Hub" },
  Varanasi: { lat: 25.3176, lon: 82.9739, notes: "Uttar Pradesh - Inland Waterway & Rail" },
  Guwahati: { lat: 26.1445, lon: 91.7362, notes: "Assam - North-East Corridor Hub" },
};

const HIGHWAY_DISTANCES = {
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
  "Pune-Bengaluru": 840,
  "Bengaluru-Pune": 840,
  "Ahmedabad-Jaipur": 670,
  "Jaipur-Ahmedabad": 670,
  "Nagpur-Mumbai": 820,
  "Mumbai-Nagpur": 820,
  "Nagpur-Delhi": 1080,
  "Delhi-Nagpur": 1080,
  "Indore-Mumbai": 585,
  "Mumbai-Indore": 585,
  "Indore-Delhi": 810,
  "Delhi-Indore": 810,
  "Delhi-Chandigarh": 250,
  "Chandigarh-Delhi": 250,
  "Delhi-Lucknow": 550,
  "Lucknow-Delhi": 550,
};

export const TRUCK_CATALOG = {
  "Mini Truck / Tata Ace (1-2 Ton)": {
    truckType: "Mini Truck / Tata Ace (1-2 Ton)",
    capacityTons: 2.0,
    ratePerKm: 22,
    baseFare: 1500,
    baseFuelConsumptionLitersPer100Km: 10,
    averageSpeedKmh: 42,
    tollRatePerKm: 1.2,
    fuelPricePerLiter: 92,
  },
  "14ft Open Body (3-4 Ton)": {
    truckType: "14ft Open Body (3-4 Ton)",
    capacityTons: 4.0,
    ratePerKm: 34,
    baseFare: 3000,
    baseFuelConsumptionLitersPer100Km: 18,
    averageSpeedKmh: 45,
    tollRatePerKm: 1.8,
    fuelPricePerLiter: 92,
  },
  "19ft Container (7-8 Ton)": {
    truckType: "19ft Container (7-8 Ton)",
    capacityTons: 8.0,
    ratePerKm: 46,
    baseFare: 5500,
    baseFuelConsumptionLitersPer100Km: 24,
    averageSpeedKmh: 48,
    tollRatePerKm: 2.4,
    fuelPricePerLiter: 92,
  },
  "24ft Multi-Axle (10-12 Ton)": {
    truckType: "24ft Multi-Axle (10-12 Ton)",
    capacityTons: 12.0,
    ratePerKm: 58,
    baseFare: 7500,
    baseFuelConsumptionLitersPer100Km: 28,
    averageSpeedKmh: 50,
    tollRatePerKm: 2.9,
    fuelPricePerLiter: 92,
  },
  "32ft Multi-Axle (15-20 Ton)": {
    truckType: "32ft Multi-Axle (15-20 Ton)",
    capacityTons: 20.0,
    ratePerKm: 72,
    baseFare: 10000,
    baseFuelConsumptionLitersPer100Km: 34,
    averageSpeedKmh: 52,
    tollRatePerKm: 3.6,
    fuelPricePerLiter: 92,
  },
  "Refrigerated Container (5-10 Ton)": {
    truckType: "Refrigerated Container (5-10 Ton)",
    capacityTons: 10.0,
    ratePerKm: 65,
    baseFare: 9000,
    baseFuelConsumptionLitersPer100Km: 32,
    averageSpeedKmh: 48,
    tollRatePerKm: 2.8,
    fuelPricePerLiter: 92,
  },
  "Flatbed Trailer (25+ Ton)": {
    truckType: "Flatbed Trailer (25+ Ton)",
    capacityTons: 35.0,
    ratePerKm: 95,
    baseFare: 14000,
    baseFuelConsumptionLitersPer100Km: 42,
    averageSpeedKmh: 46,
    tollRatePerKm: 4.2,
    fuelPricePerLiter: 92,
  },
};

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.28 * 10) / 10; // 1.28 road tortuosity
}

export function getDistanceBetween(cityA, cityB) {
  if (cityA === cityB) return 0;
  const key1 = `${cityA}-${cityB}`;
  if (HIGHWAY_DISTANCES[key1]) return HIGHWAY_DISTANCES[key1];
  const key2 = `${cityB}-${cityA}`;
  if (HIGHWAY_DISTANCES[key2]) return HIGHWAY_DISTANCES[key2];

  const coordA = CITY_COORDINATES[cityA];
  const coordB = CITY_COORDINATES[cityB];
  if (coordA && coordB) {
    return getHaversineDistance(coordA.lat, coordA.lon, coordB.lat, coordB.lon);
  }
  return 450;
}

export function computeCostSummary(distanceKm, truck, weightTons, strategy) {
  const weight = Math.max(0.5, weightTons);
  const maxTons = Math.max(1, truck.capacityTons);
  const weightMultiplier = Math.max(1, weight / (maxTons * 0.75));

  const strategyRateModifier = strategy === "Cheapest" ? 0.95 : strategy === "Fastest" ? 1.05 : 1.0;
  const tollMultiplier = strategy === "Cheapest" ? 0.75 : strategy === "Fastest" ? 1.25 : 1.0;

  const distanceFare = Math.round(distanceKm * truck.ratePerKm * weightMultiplier * strategyRateModifier);
  const baseFare = truck.baseFare;

  const fuelConsumptionPerKm =
    (truck.baseFuelConsumptionLitersPer100Km / 100) * (1 + (weight / maxTons) * 0.25);
  const estimatedFuelLiters = Math.round(distanceKm * fuelConsumptionPerKm * 10) / 10;
  const estimatedFuelCost = Math.round(estimatedFuelLiters * truck.fuelPricePerLiter);

  const estimatedTolls = Math.round(distanceKm * truck.tollRatePerKm * tollMultiplier);
  const subtotal = distanceFare + baseFare;
  const gstAmount = Math.round(subtotal * 0.05);
  const totalEstimatedCost = subtotal + gstAmount;
  const co2EmissionsKg = Math.round(estimatedFuelLiters * 2.68 * 10) / 10;

  return {
    baseFare,
    distanceFare,
    estimatedFuelCost,
    estimatedFuelLiters,
    estimatedTolls,
    subtotal,
    gstAmount,
    totalEstimatedCost,
    co2EmissionsKg,
  };
}

function computeTourDistance(sequence) {
  let dist = 0;
  for (let i = 0; i < sequence.length - 1; i++) {
    dist += getDistanceBetween(sequence[i].name, sequence[i + 1].name);
  }
  return Math.round(dist * 10) / 10;
}

function permute(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
    const perms = permute(remaining);
    for (const p of perms) {
      result.push([current, ...p]);
    }
  }
  return result;
}

/**
 * High-speed in-browser route optimization fallback (matching C# algorithm)
 */
export function solveRouteLocally({
  origin,
  stops,
  destination,
  isRoundTrip,
  truckType,
  totalWeightTons,
  strategy = "Balanced",
}) {
  const originPt = {
    name: origin.name,
    latitude: CITY_COORDINATES[origin.name]?.lat || 19.076,
    longitude: CITY_COORDINATES[origin.name]?.lon || 72.8777,
    notes: CITY_COORDINATES[origin.name]?.notes || "Origin Hub",
  };

  const destPt = isRoundTrip
    ? {
        name: `${origin.name} (Return Hub)`,
        latitude: originPt.latitude,
        longitude: originPt.longitude,
        notes: "Round-trip return to base depot",
      }
    : destination?.name
    ? {
        name: destination.name,
        latitude: CITY_COORDINATES[destination.name]?.lat || 28.7041,
        longitude: CITY_COORDINATES[destination.name]?.lon || 77.1025,
        notes: CITY_COORDINATES[destination.name]?.notes || "Final Destination",
      }
    : null;

  const truck = TRUCK_CATALOG[truckType] || TRUCK_CATALOG["14ft Open Body (3-4 Ton)"];

  // 1. Unoptimized baseline
  const unoptimizedSequence = [originPt, ...stops, ...(destPt ? [destPt] : [])];
  const originalDistance = computeTourDistance(unoptimizedSequence);
  const originalCost = computeCostSummary(originalDistance, truck, totalWeightTons, strategy);

  // 2. Solve optimal stop sequence
  let optimizedStops = [...stops];
  let algorithmUsed = "Branch-and-Bound Exact TSP Permutation";

  if (stops.length > 1 && stops.length <= 8) {
    const permutations = permute(stops);
    let minDistance = Infinity;
    for (const candidate of permutations) {
      const tour = [originPt, ...candidate, ...(destPt ? [destPt] : [])];
      const dist = computeTourDistance(tour);
      if (dist < minDistance) {
        minDistance = dist;
        optimizedStops = candidate;
      }
    }
    algorithmUsed = `Exact TSP Permutation (Tested ${permutations.length} tours)`;
  } else if (stops.length > 8) {
    // 2-Opt local search
    let tour = [...stops];
    let improved = true;
    let iter = 0;
    while (improved && iter++ < 100) {
      improved = false;
      for (let i = 0; i < tour.length - 1; i++) {
        for (let k = i + 1; k < tour.length; k++) {
          const currentDist = computeTourDistance([originPt, ...tour, ...(destPt ? [destPt] : [])]);
          const candidate = [
            ...tour.slice(0, i),
            ...tour.slice(i, k + 1).reverse(),
            ...tour.slice(k + 1),
          ];
          const newDist = computeTourDistance([originPt, ...candidate, ...(destPt ? [destPt] : [])]);
          if (newDist < currentDist - 0.1) {
            tour = candidate;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }
    optimizedStops = tour;
    algorithmUsed = "Nearest Neighbor + 2-Opt Iterative Edge Swap";
  }

  const optimizedSequence = [originPt, ...optimizedStops, ...(destPt ? [destPt] : [])];
  const optimizedDistance = computeTourDistance(optimizedSequence);
  const optimizedCost = computeCostSummary(optimizedDistance, truck, totalWeightTons, strategy);

  // Build legs
  const legs = [];
  let cumulativeDist = 0;
  let currentPayload = totalWeightTons;

  for (let i = 0; i < optimizedSequence.length - 1; i++) {
    const from = optimizedSequence[i];
    const to = optimizedSequence[i + 1];
    const legDist = getDistanceBetween(from.name.replace(" (Return Hub)", ""), to.name.replace(" (Return Hub)", ""));
    cumulativeDist += legDist;
    const legHours = Math.round((legDist / truck.averageSpeedKmh) * 10) / 10;
    const legCost = computeCostSummary(legDist, truck, currentPayload, strategy);

    if (to.demandWeightTons) {
      currentPayload = Math.max(0.5, currentPayload - to.demandWeightTons);
    }

    legs.push({
      legIndex: i + 1,
      from,
      to,
      distanceKm: legDist,
      estimatedHours: legHours,
      fuelCost: legCost.estimatedFuelCost,
      tollCost: legCost.estimatedTolls,
      cumulativeDistanceKm: Math.round(cumulativeDist * 10) / 10,
      currentPayloadTons: Math.round(currentPayload * 10) / 10,
    });
  }

  const distanceSaved = Math.max(0, Math.round((originalDistance - optimizedDistance) * 10) / 10);
  const pctSaved = originalDistance > 0 ? Math.round((distanceSaved / originalDistance) * 1000) / 10 : 0;
  const costSaved = Math.max(0, Math.round(originalCost.totalEstimatedCost - optimizedCost.totalEstimatedCost));
  const hoursSaved = Math.max(0, Math.round(((originalDistance - optimizedDistance) / truck.averageSpeedKmh) * 10) / 10);
  const co2Saved = Math.max(0, Math.round((originalCost.co2EmissionsKg - optimizedCost.co2EmissionsKg) * 10) / 10);

  return {
    engine: "In-Browser Hybrid Solver (Identical Algorithm to C# .NET Engine)",
    algorithm: algorithmUsed,
    strategy,
    truckSpecification: truck,
    totalDistanceKm: optimizedDistance,
    totalDrivingHours: Math.round(legs.reduce((acc, l) => acc + l.estimatedHours, 0) * 10) / 10,
    costSummary: optimizedCost,
    savings: {
      originalDistanceKm: originalDistance,
      optimizedDistanceKm: optimizedDistance,
      distanceSavedKm: distanceSaved,
      percentageDistanceSaved: pctSaved,
      costSavedInr: costSaved,
      hoursSaved,
      co2SavedKg: co2Saved,
    },
    legs,
    orderedWaypoints: optimizedSequence,
    processedAtUtc: new Date().toISOString(),
    isLocalFallback: true,
  };
}
