const OPTIMIZER_URL = process.env.OPTIMIZER_SERVICE_URL || "http://127.0.0.1:5050";

/**
 * Check if the C# Route Optimization Microservice is active
 */
export async function getOptimizerStatus(req, res) {
  try {
    const response = await fetch(`${OPTIMIZER_URL}/api/optimizer/health`, {
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      const data = await response.json();
      return res.json({
        online: true,
        serviceUrl: OPTIMIZER_URL,
        details: data
      });
    }

    return res.status(502).json({
      online: false,
      serviceUrl: OPTIMIZER_URL,
      message: "C# Route Optimizer returned non-200 status."
    });
  } catch (error) {
    return res.json({
      online: false,
      serviceUrl: OPTIMIZER_URL,
      message: "C# Route Optimizer service is currently offline. Start it with 'npm run dev:optimizer' or 'dotnet run --project services/Freto.RouteOptimizer'.",
      error: error.message
    });
  }
}

/**
 * Proxy multi-stop route optimization request to C# .NET Engine
 */
export async function optimizeRoute(req, res) {
  try {
    const response = await fetch(`${OPTIMIZER_URL}/api/optimizer/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(10000)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Optimizer proxy error:", error.message);
    return res.status(503).json({
      message: "C# Route Optimization Engine is unavailable.",
      hint: "Make sure the C# service is running on port 5050. Run 'npm run dev:optimizer' to start it.",
      error: error.message
    });
  }
}

/**
 * Fetch supported freight hub cities from C# service
 */
export async function getSupportedCities(req, res) {
  try {
    const response = await fetch(`${OPTIMIZER_URL}/api/optimizer/cities`, {
      signal: AbortSignal.timeout(4000)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(503).json({
      message: "Could not connect to C# Route Optimizer.",
      error: error.message
    });
  }
}

/**
 * Proxy fleet consolidation (CVRP) request to C# .NET Engine
 */
export async function consolidateFleet(req, res) {
  try {
    const response = await fetch(`${OPTIMIZER_URL}/api/optimizer/consolidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(503).json({
      message: "C# Fleet Consolidation Engine is unavailable.",
      error: error.message
    });
  }
}
