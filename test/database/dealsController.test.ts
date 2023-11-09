import {initDatabase} from "../../config/config";
initDatabase()
import {Deal} from "../../database/models/Deal";
import {DealsController} from "../../database/controllers/dealsController"

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
      cancelled: true,
      cancelledAt: 1,
      metadata: "DataTypes.STRING",
      network: "DataTypes.STRING"
    };

    const newDeal = await DealsController.upsertDeal(deal)
    // @ts-ignore
    expect(newDeal[0].dataValues).toStrictEqual(deal);

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
      cancelled: true,
      cancelledAt: 1,
      metadata: "DataTypes.STRING",
      network: "DataTypes.STRING"
    };

    const updatedDeal = await DealsController.upsertDeal(updatedDealData);

    // @ts-ignore
    expect(updatedDeal[0].dataValues).toStrictEqual(updatedDealData);
  });

  test("get deal", async () => {
    const nullDeal = await DealsController.getDealById(2)

    expect(nullDeal).toBeNull()

    const deal = await DealsController.getDealById(1)

    // @ts-ignore
    expect(deal.id).toBe("1")
  })

  test("delete deal", async () => {
    const nullDeal = await DealsController.deleteDealById(2)

    expect(nullDeal).toBeNull()

    const deal = await DealsController.deleteDealById(1)

    // @ts-ignore
    expect(deal.id).toBe("1")
  })
});
