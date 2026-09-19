import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";
import { Driver, User, Truck } from "../models/postgres/index.js";

const router = Router();
router.use(authenticate, requireRole("TRANSPORTER"));

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        userId: z.string(),
        drivingLicence: z.string(),
        licenceValidTill: z.string().optional(),
        emergencyContact: z.string().optional(),
        truckId: z.string().optional(),
      })
      .parse(req.body);

    const user = await User.findByPk(dto.userId);
    if (!user) throw new AppError(404, "User not found");
    if (user.primaryRole !== "DRIVER") throw new AppError(400, "User's primary role must be DRIVER");

    if (await Driver.findOne({ where: { userId: dto.userId } })) {
      throw new AppError(409, "This user is already registered as a driver");
    }
    if (await Driver.findOne({ where: { drivingLicence: dto.drivingLicence } })) {
      throw new AppError(409, "This driving licence is already registered");
    }
    if (dto.truckId) {
      const truck = await Truck.findByPk(dto.truckId);
      if (!truck || truck.organizationId !== req.user.orgId) {
        throw new AppError(400, "Truck does not belong to this organization");
      }
    }

    res.status(201).json(
      await Driver.create({
        ...dto,
        organizationId: req.user.orgId,
        licenceValidTill: dto.licenceValidTill ? new Date(dto.licenceValidTill) : null,
      }),
    );
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await Driver.findAll({ where: { organizationId: req.user.orgId }, include: [User, Truck] }));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const driver = await Driver.findByPk(req.params.id, { include: [User, Truck] });
    if (!driver) throw new AppError(404, "Driver not found");
    if (driver.organizationId !== req.user.orgId) throw new AppError(403, "Forbidden");
    res.json(driver);
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const dto = z.object({ truckId: z.string().optional(), emergencyContact: z.string().optional() }).parse(req.body);
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) throw new AppError(404, "Driver not found");
    if (driver.organizationId !== req.user.orgId) throw new AppError(403, "Forbidden");

    if (dto.truckId) {
      const truck = await Truck.findByPk(dto.truckId);
      if (!truck || truck.organizationId !== req.user.orgId) {
        throw new AppError(400, "Truck does not belong to this organization");
      }
    }
    res.json(await driver.update(dto));
  }),
);

export default router;
