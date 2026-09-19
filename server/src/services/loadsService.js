import { Op } from "sequelize";
import { pgSequelize } from "../config/postgres.js";
import { Load, Bid } from "../models/postgres/index.js";
import { AppError } from "../middleware/error.js";

const LOAD_TRANSITIONS = {
  DRAFT: ["POSTED", "CANCELLED"],
  POSTED: ["BIDDING", "CANCELLED"],
  BIDDING: ["BOOKED", "CANCELLED"],
  BOOKED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function createLoad(shipperOrgId, dto) {
  return Load.create({ ...dto, shipperOrgId, status: "DRAFT" });
}

export async function transitionLoad(shipperOrgId, loadId, next) {
  const load = await Load.findByPk(loadId);
  if (!load) throw new AppError(404, "Load not found");
  if (load.shipperOrgId !== shipperOrgId) throw new AppError(403, "Forbidden");

  const allowed = LOAD_TRANSITIONS[load.status] ?? [];
  if (!allowed.includes(next)) {
    throw new AppError(400, `Cannot move load from ${load.status} to ${next}`);
  }
  return load.update({ status: next });
}

/**
 * Proximity search using PostGIS via a raw parameterized query — Sequelize's
 * query builder doesn't express geography predicates natively.
 */
export async function searchLoads({ vehicleType, nearLat, nearLng, radiusKm = 100, page = 1, pageSize = 20 }) {
  const limit = Math.min(pageSize, 50);
  const offset = (page - 1) * limit;

  if (nearLat != null && nearLng != null) {
    const radiusMeters = radiusKm * 1000;
    const [rows] = await pgSequelize.query(
      `SELECT * FROM "Loads"
       WHERE status = 'POSTED'
         AND ST_DWithin(
           ST_MakePoint("pickupLng", "pickupLat")::geography,
           ST_MakePoint(:lng, :lat)::geography,
           :radius
         )
       ORDER BY "createdAt" DESC
       LIMIT :limit OFFSET :offset`,
      { replacements: { lng: nearLng, lat: nearLat, radius: radiusMeters, limit, offset } },
    );
    return rows;
  }

  return Load.findAll({
    where: { status: "POSTED", ...(vehicleType ? { vehicleType } : {}) },
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });
}

export async function getLoadById(id) {
  const load = await Load.findByPk(id, { include: [Bid] });
  if (!load) throw new AppError(404, "Load not found");
  return load;
}
