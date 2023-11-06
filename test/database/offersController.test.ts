import {Offer} from "../../database/models/Offer";
import {bigint, ZodBigInt} from "zod";
import {BIGINT} from "sequelize";

let {upsertOffer} = require("../../database/controllers/offersController");

beforeAll(async () => {
  await Offer.sync({force: true});
});

afterAll(async () => {
  await Offer.drop();
});

describe("Offer controller", () => {
  test("should create a new offer", async () => {
    //creates a new offer and check if it was created
    const offer = {
      id: 1,
      maximumDeals: 1,
      pricePerSecond: BigInt(1),
      billFullPeriods: true,
      provider: "provider",
      autoAccept: true,
      minDealDuration: 1,
      label: "label",
      nodeLocations: ["nodeLocations"],
      autoSsl: true,
      customCnames: true,
      burstSpeed: 1,
      bandwidthLimit: "bandwidthLimit",
    }
    let newOffer = await upsertOffer([offer]);

    await expect(newOffer[0].id).toBe(offer.id);

    //updates the offer and check if it was updated

    offer.maximumDeals = 2;
    newOffer = await upsertOffer([offer]);
    await expect(newOffer[0].maximumDeals).toBe(offer.maximumDeals);
  })
})