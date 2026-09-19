import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../middleware/error.js";
import { createUploadUrl } from "../services/storageService.js";
import { KycDocument, Organization, Driver, Truck } from "../models/postgres/index.js";

const router = Router();
router.use(authenticate);

const DOC_TYPES = [
  "PAN", "GST_CERTIFICATE", "ADDRESS_PROOF", "BANK_PROOF", "RC", "INSURANCE",
  "FITNESS_CERTIFICATE", "PUC", "PERMIT", "DRIVING_LICENCE", "LR", "POD", "INVOICE", "OTHER",
];

async function rollUpStatus(where) {
  const docs = await KycDocument.findAll({ where });
  if (docs.length === 0) return "NOT_SUBMITTED";
  if (docs.some((d) => d.status === "REJECTED")) return "REJECTED";
  if (docs.some((d) => d.status === "PENDING")) return "PENDING";
  return "APPROVED";
}

async function syncOwnerStatus(doc) {
  if (doc.organizationId) {
    await Organization.update(
      { kycStatus: await rollUpStatus({ organizationId: doc.organizationId }) },
      { where: { id: doc.organizationId } },
    );
  }
  if (doc.driverId) {
    await Driver.update(
      { verificationStatus: await rollUpStatus({ driverId: doc.driverId }) },
      { where: { id: doc.driverId } },
    );
  }
  if (doc.truckId) {
    await Truck.update(
      { kycStatus: await rollUpStatus({ truckId: doc.truckId }) },
      { where: { id: doc.truckId } },
    );
  }
}

router.post(
  "/upload-url",
  requireRole("SHIPPER", "TRANSPORTER"),
  asyncHandler(async (req, res) => {
    const { type, contentType } = z.object({ type: z.enum(DOC_TYPES), contentType: z.string() }).parse(req.body);
    res.json(await createUploadUrl(`kyc/${type.toLowerCase()}`, contentType));
  }),
);

router.post(
  "/documents",
  requireRole("SHIPPER", "TRANSPORTER"),
  asyncHandler(async (req, res) => {
    const dto = z
      .object({
        type: z.enum(DOC_TYPES),
        fileUrl: z.string(),
        driverId: z.string().optional(),
        truckId: z.string().optional(),
      })
      .parse(req.body);

    if (dto.driverId) {
      const driver = await Driver.findByPk(dto.driverId);
      if (!driver || driver.organizationId !== req.user.orgId) {
        throw new AppError(400, "Driver does not belong to this organization");
      }
    }
    if (dto.truckId) {
      const truck = await Truck.findByPk(dto.truckId);
      if (!truck || truck.organizationId !== req.user.orgId) {
        throw new AppError(400, "Truck does not belong to this organization");
      }
    }

    const doc = await KycDocument.create({
      organizationId: !dto.driverId && !dto.truckId ? req.user.orgId : null,
      driverId: dto.driverId ?? null,
      truckId: dto.truckId ?? null,
      type: dto.type,
      fileUrl: dto.fileUrl,
      status: "PENDING",
    });

    await syncOwnerStatus(doc);
    res.status(201).json(doc);
  }),
);

router.get(
  "/documents/pending",
  requireRole("ADMIN", "OPERATIONS"),
  asyncHandler(async (req, res) => {
    res.json(
      await KycDocument.findAll({
        where: { status: "PENDING" },
        order: [["createdAt", "ASC"]],
        include: [Organization, Driver, Truck],
      }),
    );
  }),
);

router.post(
  "/documents/:id/review",
  requireRole("ADMIN", "OPERATIONS"),
  asyncHandler(async (req, res) => {
    const { decision } = z.object({ decision: z.enum(["APPROVED", "REJECTED"]) }).parse(req.body);
    const doc = await KycDocument.findByPk(req.params.id);
    if (!doc) throw new AppError(404, "Document not found");
    if (doc.status !== "PENDING") throw new AppError(400, "Document has already been reviewed");

    await doc.update({ status: decision, reviewedBy: req.user.id, reviewedAt: new Date() });
    await syncOwnerStatus(doc);

    res.json(doc);
  }),
);

export default router;
