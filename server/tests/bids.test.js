import { Organization, Load, Bid } from "../src/models/postgres/index.js";
import * as loadsService from "../src/services/loadsService.js";
import * as bidsService from "../src/services/bidsService.js";

async function makeOrg(legalName) {
  return Organization.create({ legalName, status: "ACTIVE" });
}

async function makePostedLoad(shipperOrg) {
  const load = await loadsService.createLoad(shipperOrg.id, {
    pickupAddress: "Ludhiana, Punjab",
    pickupLat: 30.901,
    pickupLng: 75.8573,
    dropAddress: "Delhi",
    dropLat: 28.7041,
    dropLng: 77.1025,
    vehicleType: "OPEN_TRUCK",
    weightKg: 5000,
    materialType: "Textiles",
    pickupWindowStart: new Date().toISOString(),
    pickupWindowEnd: new Date(Date.now() + 86_400_000).toISOString(),
    targetFreightPaise: 5_000_00,
  });
  return loadsService.transitionLoad(shipperOrg.id, load.id, "POSTED");
}

describe("bids service — accept-bid transaction", () => {
  test("accepting a bid books the load, creates a booking, and rejects competing bids", async () => {
    const shipperOrg = await makeOrg("Shipper Co");
    const transporterA = await makeOrg("Transporter A");
    const transporterB = await makeOrg("Transporter B");

    const load = await makePostedLoad(shipperOrg);

    const bidA = await bidsService.placeBid(transporterA.id, load.id, { amountPaise: 4_800_00 });
    const bidB = await bidsService.placeBid(transporterB.id, load.id, { amountPaise: 4_500_00 });

    const booking = await bidsService.acceptBid(shipperOrg.id, bidA.id);

    expect(booking.loadId).toBe(load.id);
    expect(booking.bidId).toBe(bidA.id);
    expect(booking.agreedPricePaise).toBe(4_800_00);

    const reloadedLoad = await Load.findByPk(load.id);
    expect(reloadedLoad.status).toBe("BOOKED");

    const reloadedBidA = await Bid.findByPk(bidA.id);
    const reloadedBidB = await Bid.findByPk(bidB.id);
    expect(reloadedBidA.status).toBe("ACCEPTED");
    expect(reloadedBidB.status).toBe("REJECTED");
  });

  test("a shipper cannot accept a bid on someone else's load", async () => {
    const shipperOrg = await makeOrg("Shipper Co 2");
    const otherShipperOrg = await makeOrg("Not The Owner");
    const transporter = await makeOrg("Transporter C");

    const load = await makePostedLoad(shipperOrg);
    const bid = await bidsService.placeBid(transporter.id, load.id, { amountPaise: 3_000_00 });

    await expect(bidsService.acceptBid(otherShipperOrg.id, bid.id)).rejects.toMatchObject({ status: 403 });
  });

  test("cannot accept the same bid twice", async () => {
    const shipperOrg = await makeOrg("Shipper Co 3");
    const transporter = await makeOrg("Transporter D");

    const load = await makePostedLoad(shipperOrg);
    const bid = await bidsService.placeBid(transporter.id, load.id, { amountPaise: 3_500_00 });

    await bidsService.acceptBid(shipperOrg.id, bid.id);
    await expect(bidsService.acceptBid(shipperOrg.id, bid.id)).rejects.toMatchObject({ status: 400 });
  });

  test("cannot place a bid on a load that isn't open for bidding", async () => {
    const shipperOrg = await makeOrg("Shipper Co 4");
    const transporter = await makeOrg("Transporter E");

    const draftLoad = await loadsService.createLoad(shipperOrg.id, {
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

    await expect(bidsService.placeBid(transporter.id, draftLoad.id, { amountPaise: 1000 })).rejects.toMatchObject({
      status: 400,
    });
  });
});
