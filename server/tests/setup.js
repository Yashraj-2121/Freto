import "dotenv/config";
import { pgSequelize } from "../src/config/postgres.js";
import { redis } from "../src/config/redis.js";
import "../src/models/postgres/index.js";

// Tests run against POSTGRES_URL as configured in the test environment
// (see .github/workflows/ci.yml) — expected to be a disposable database,
// never a real one. `sync({ force: true })` drops and recreates every
// table, which is exactly what a test suite wants and exactly what the
// app's own boot path (src/index.js) deliberately does NOT do anymore.
beforeAll(async () => {
  await pgSequelize.authenticate();
  await pgSequelize.query("CREATE EXTENSION IF NOT EXISTS postgis");
  await pgSequelize.sync({ force: true });
});

afterAll(async () => {
  await pgSequelize.close();
  redis.disconnect();
});
