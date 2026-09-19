import { pgSequelize } from "../config/postgres.js";
import { Booking, Bid, Load, Truck, Driver, Trip } from "../models/postgres/index.js";
import { AppError } from "../middleware/error.js";

export async function listMyBookings(transporterOrgId) {
  return Booking.findAll({
    include: [{ model: Bid, where: { transporterOrgId } }, Load, Trip],
    order: [["createdAt", "DESC"]],
  });
}

export async function assignTruckDriver(transporterOrgId, bookingId, { truckId, driverId }) {
  return pgSequelize.transaction(async (t) => {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Bid, required: true },
        { model: Load, required: true },
      ],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!booking) throw new AppError(404, "Booking not found");
    if (booking.Bid.transporterOrgId !== transporterOrgId) throw new AppError(403, "Forbidden");
    if (booking.status !== "CONFIRMED") {
      throw new AppError(400, `Cannot assign a booking in status ${booking.status}`);
    }

    const truck = await Truck.findByPk(truckId, { transaction: t });
    const driver = await Driver.findByPk(driverId, { transaction: t });
    if (!truck || truck.organizationId !== transporterOrgId) {
      throw new AppError(400, "Truck does not belong to this organization");
    }
    if (!driver || driver.organizationId !== transporterOrgId) {
      throw new AppError(400, "Driver does not belong to this organization");
    }

    await booking.update({ truckId: truck.id, status: "DRIVER_ASSIGNED" }, { transaction: t });
    await Load.update({ status: "ASSIGNED" }, { where: { id: booking.loadId }, transaction: t });

    return Trip.create({ bookingId: booking.id, driverId: driver.id, status: "ASSIGNED" }, { transaction: t });
  });
}
