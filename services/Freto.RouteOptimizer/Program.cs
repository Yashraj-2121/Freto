using Freto.RouteOptimizer.Services;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services & Dependency Injection
builder.Services.AddSingleton<ICityRegistry, CityRegistry>();
builder.Services.AddSingleton<ICostCalculationService, CostCalculationService>();
builder.Services.AddScoped<IRouteOptimizerService, RouteOptimizerService>();

// 2. Add API Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// 3. Add CORS for Frontend & Backend Access
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 4. Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FRETO Route Optimization Engine API",
        Version = "v1.0",
        Description = "C# .NET High-Performance Logistics & Fleet Route Optimization Microservice for FRETO FreightFlow."
    });
});

var app = builder.Build();

// 5. Middleware Pipeline
app.UseCors();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FRETO Route Optimizer v1");
    c.RoutePrefix = "swagger";
});

// Root welcome & health redirection
app.MapGet("/", () => Results.Ok(new
{
    service = "FRETO Route Optimization Engine (C# .NET 8 LTS)",
    status = "healthy",
    docs = "/swagger",
    health = "/api/optimizer/health",
    sample = "/api/optimizer/sample-demo"
}));

app.MapControllers();

Console.WriteLine("=============================================================");
Console.WriteLine("🚚 FRETO C# Route Optimization Engine Started (.NET 8 LTS)");
Console.WriteLine("📍 Swagger Docs:   http://localhost:5050/swagger");
Console.WriteLine("⚡ Health Status:  http://localhost:5050/api/optimizer/health");
Console.WriteLine("=============================================================");

app.Run();
