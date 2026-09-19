import { Op } from "sequelize";
import { pgSequelize } from "../config/postgres.js";
import { Load, Bid, Booking } from "../models/postgres/index.js";
import { AppError } from "../middleware/error.js";

export async function placeBid(transporterOrgId, loadId, { amountPaise, message }) {
  return pgSequelize.transaction(async (t) => {
    const load = await Load.findByPk(loadId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!load) throw new AppError(404, "Load not found");
    if (!["POSTED", "BIDDING"].includes(load.status)) {
      throw new AppError(400, "Load is not open for bidding");
    }

    const bid = await Bid.create(
      { loadId, transporterOrgId, amountPaise, message, status: "PLACED" },
      { transaction: t },
    );
    await load.update({ status: "BIDDING" }, { transaction: t });
    return bid;
  });
}

export async function withdrawBid(transporterOrgId, bidId) {
  const bid = await Bid.findByPk(bidId);
  if (!bid) throw new AppError(404, "Bid not found");
  if (bid.transporterOrgId !== transporterOrgId) throw new AppError(403, "Forbidden");
  if (!["PLACED", "COUNTERED"].includes(bid.status)) {
    throw new AppError(400, `Cannot withdraw a bid in status ${bid.status}`);
  }
  return bid.update({ status: "WITHDRAWN" });
}

/**
 * Accepting a bid runs entirely inside one DB transaction with row locking:
 * accept the bid, reject every competitor, flip the load to BOOKED, and
 * create the Booking — all or nothing.
 */
export async function acceptBid(shipperOrgId, bidId) {
  return pgSequelize.transaction(async (t) => {
    const bid = await Bid.findByPk(bidId, {
      include: [{ model: Load, required: true }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!bid) throw new AppError(404, "Bid not found");
    if (bid.Load.shipperOrgId !== shipperOrgId) throw new AppError(403, "Forbidden");
    if (!["PLACED", "COUNTERED"].includes(bid.status)) {
      throw new AppError(400, `Bid is not acceptable in status ${bid.status}`);
    }
    if (bid.Load.status !== "BIDDING") {
      throw new AppError(400, "Load is no longer open for booking");
    }

    await bid.update({ status: "ACCEPTED" }, { transaction: t });

    await Bid.update(
      { status: "REJECTED" },
      {
        where: { loadId: bid.loadId, id: { [Op.ne]: bid.id }, status: { [Op.in]: ["PLACED", "COUNTERED"] } },
        transaction: t,
      },
    );

    await Load.update({ status: "BOOKED" }, { where: { id: bid.loadId }, transaction: t });

    return Booking.create(
      { loadId: bid.loadId, bidId: bid.id, agreedPricePaise: bid.amountPaise, status: "CONFIRMED" },
      { transaction: t },
    );
  });
}
