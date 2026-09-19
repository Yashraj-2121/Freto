import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";
import { createUploadUrl } from "../services/storageService.js";
import { pgSequelize } from "../config/postgres.js";
import { Trip, Driver, ShipmentDocument } from "../models/postgres/index.js";

const router = Router();
router.use(authenticate);

const DOC_TYPES = [
  "PAN", "GST_CERTIFICATE", "ADDRESS_PROOF", "BANK_PROOF", "RC", "INSURANCE",
  "FITNESS_CERTIFICATE", "PUC", "PERMIT", "DRIVING_LICENCE", "LR", "POD", "INVOICE", "OTHER",
];

router.post(
  "/documents/upload-url",
  requireRole("DRIVER"),
  asyncHandler(async (req, res) => {
    const { type, contentType } = z.object({ type: z.enum(DOC_TYPES), contentType: z.string() }).parse(req.body);
    res.json(await createUploadUrl(`shipments/${type.toLowerCase()}`, contentType));
  }),
);

router.post(
  "/trips/:tripId/documents",
  requireRole("DRIVER"),
  asyncHandler(async (req, res) => {
    const dto = z.object({ type: z.enum(DOC_TYPES), fileUrl: z.string() }).parse(req.body);

    const result = await pgSequelize.transaction(async (t) => {
      const trip = await Trip.findByPk(req.params.tripId, {
        include: [{ model: Driver, required: true }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!trip) throw new AppError(404, "Trip not found");
      if (trip.Driver.userId !== req.user.id) throw new AppError(403, "Forbidden");

      const doc = await ShipmentDocument.create(
        { tripId: req.params.tripId, type: dto.type, fileUrl: dto.fileUrl, uploadedBy: req.user.id },
        { transaction: t },
      );

      // Submitting a POD is what advances the trip — the driver isn't
      // trusted to separately self-report "POD uploaded" via /trips/:id/status.
      if (dto.type === "POD" && trip.status === "UNLOADED") {
        await trip.update({ status: "POD_UPLOADED" }, { transaction: t });
      }

      return doc;
    });

    res.status(201).json(result);
  }),
);

router.get(
  "/trips/:tripId/documents",
  requireRole("DRIVER", "SHIPPER", "TRANSPORTER", "ADMIN", "OPERATIONS"),
  asyncHandler(async (req, res) => {
    res.json(
      await ShipmentDocument.findAll({ where: { tripId: req.params.tripId }, order: [["createdAt", "DESC"]] }),
    );
  }),
);

export default router;
