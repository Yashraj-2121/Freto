import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { Umzug, SequelizeStorage } from "umzug";
import { pgSequelize } from "./config/postgres.js";
import { mysqlSequelize } from "./config/mysql.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function makeUmzug(sequelize, glob) {
  return new Umzug({
    migrations: { glob, resolve: ({ name, path: p, context }) => ({ name, up: async () => (await import(p)).up(context), down: async () => (await import(p)).down(context) }) },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: "SequelizeMeta" }),
    logger: console,
  });
}

async function run() {
  const direction = process.argv[2] ?? "up"; // "up" | "down"

  const pgUmzug = makeUmzug(pgSequelize, path.join(__dirname, "../migrations/postgres/*.js"));
  const mysqlUmzug = makeUmzug(mysqlSequelize, path.join(__dirname, "../migrations/mysql/*.js"));

  await pgSequelize.authenticate();
  await mysqlSequelize.authenticate();

  if (direction === "up") {
    await pgUmzug.up();
    console.log("PostgreSQL migrations applied");
    await mysqlUmzug.up();
    console.log("MySQL migrations applied");
  } else if (direction === "down") {
    await pgUmzug.down();
    await mysqlUmzug.down();
    console.log("Last migration reverted on both databases");
  } else {
    throw new Error(`Unknown direction "${direction}" — use "up" or "down"`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
