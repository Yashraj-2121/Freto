import { Organization } from "../src/models/postgres/index.js";
import * as loadsService from "../src/services/loadsService.js";

async function makeShipper() {
  return Organization.create({ legalName: "State Machine Shipper " + Math.random(), status: "ACTIVE" });
}

async function makeDraftLoad(orgId) {
  return loadsService.createLoad(orgId, {
    pickupAddress: "A",
    pickupLat: 0,
    pickupLng: 0,
    dropAddress: "B",
    dropLat: 1,
    dropLng: 1,
    vehicleType: "OPEN_TRUCK",
    weightKg: 1000,
    materialType: "Misc",
    pickupWindowStart: new Date().toISOString(),
    pickupWindowEnd: new Date().toISOString(),
  });
}

describe("loads service — status transitions", () => {
  test("a new load starts in DRAFT and can move to POSTED", async () => {
    const org = await makeShipper();
    const load = await makeDraftLoad(org.id);
    expect(load.status).toBe("DRAFT");

    const posted = await loadsService.transitionLoad(org.id, load.id, "POSTED");
    expect(posted.status).toBe("POSTED");
  });

  test("cannot skip straight from DRAFT to BOOKED", async () => {
    const org = await makeShipper();
    const load = await makeDraftLoad(org.id);

    await expect(loadsService.transitionLoad(org.id, load.id, "BOOKED")).rejects.toMatchObject({ status: 400 });
  });

  test("cannot transition a load belonging to a different org", async () => {
    const owner = await makeShipper();
    const stranger = await makeShipper();
    const load = await makeDraftLoad(owner.id);

    await expect(loadsService.transitionLoad(stranger.id, load.id, "POSTED")).rejects.toMatchObject({ status: 403 });
  });

  test("a cancelled load has no further valid transitions", async () => {
    const org = await makeShipper();
    const load = await makeDraftLoad(org.id);
    await loadsService.transitionLoad(org.id, load.id, "POSTED");
    await loadsService.transitionLoad(org.id, load.id, "CANCELLED");

    await expect(loadsService.transitionLoad(org.id, load.id, "POSTED")).rejects.toMatchObject({ status: 400 });
  });
});
