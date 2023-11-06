import {Deal} from "../../database/models/Deal";

let { upsertDeal } = require('../../database/controllers/dealsController');


beforeAll(async () => {
  await Deal.sync({force: true})
});

afterAll(async () => {
  await Deal.drop();
})

describe('Deal Controller', () => {

  test('should create or update a deal', async () => {
    //creates a deal and checks if it was created
    const deal = {
      id: "1",
      offerId: "1",
      client: "DataTypes.STRING",
      provider: "DataTypes.STRING",
      resourceId: "DataTypes.STRING",
      totalPayment: "DataTypes.STRING",
      blockedBalance: "DataTypes.STRING",
      pricePerSecond: "DataTypes.STRING",
      minDuration: 1,
      billFullPeriods: true,
      singlePeriodOnly: true,
      createdAt: 1,
      acceptedAt: 1,
      billingStart: 1,
      active: true,
      cancelled: 1,
      cancelledAt: 1,
      metadata: "DataTypes.STRING",
      network: "DataTypes.STRING"
    };

    const newDeal = await upsertDeal(deal)

    await expect(newDeal[0].id).toBe(deal.id);

    // update deal and check if it was updated
    const updatedDealData = {
      id: "1",
      offerId: "1",
      client: "DataTypes.STRING",
      provider: "DataTypes.STRING",
      resourceId: "DataTypes.STRING",
      totalPayment: "DataTypes.STRING",
      blockedBalance: "DataTypes.STRING",
      pricePerSecond: "DataTypes.STRING",
      minDuration: 1,
      billFullPeriods: true,
      singlePeriodOnly: true,
      createdAt: 1,
      acceptedAt: 1,
      billingStart: 1,
      active: false,
      cancelled: 1,
      cancelledAt: 1,
      metadata: "DataTypes.STRING",
      network: "DataTypes.STRING"
    };

/*
    const updatedDeal = await upsertDeal(updatedDealData);

    await expect(updatedDeal[0].id).toBe(updatedDealData.id);*/
  });
});
