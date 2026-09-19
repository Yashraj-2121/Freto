import "dotenv/config";
import { pgSequelize } from "../config/postgres.js";
import { User, Organization, OrganizationMember } from "../models/postgres/index.js";

async function run() {
  await pgSequelize.authenticate();

  const shipperUser = await User.create({ phone: "+919900000001", primaryRole: "SHIPPER", fullName: "Demo Shipper" });
  const shipperOrg = await Organization.create({ legalName: "Demo Shipper Pvt Ltd", status: "ACTIVE" });
  await OrganizationMember.create({ organizationId: shipperOrg.id, userId: shipperUser.id, role: "SHIPPER" });

  const transporterUser = await User.create({
    phone: "+919900000002",
    primaryRole: "TRANSPORTER",
    fullName: "Demo Transporter",
  });
  const transporterOrg = await Organization.create({ legalName: "Demo Transport Co", status: "ACTIVE" });
  await OrganizationMember.create({
    organizationId: transporterOrg.id,
    userId: transporterUser.id,
    role: "TRANSPORTER",
  });

  console.log("Seeded demo shipper and transporter accounts.");
  console.log("Shipper phone:", shipperUser.phone);
  console.log("Transporter phone:", transporterUser.phone);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
