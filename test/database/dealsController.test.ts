import {Deal, DealMetadata} from "../../database/models/deals/Deal";
import {DealsController} from "../../database/controllers/dealsController"
import {Resource} from "../../database/models/Resource";
import {ResourcesController} from "../../database/controllers/resourcesController";
import {resetDB} from "../../database/utils";

const mockDeal = {
  id: 1,
  offerId: 1n,
  client: '0xB76c9A2fC1367f92cBB73b1ECE0c98Abb0c5097B',
  provider: '0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31',
  resourceId: 3n,
  totalPayment: 0n,
  blockedBalance: 446499999999553500n,
  terms: {
    pricePerSecond: 111111111111n,
    minDealDuration: 900n,
    billFullPeriods: false,
    singlePeriodOnly: false,
    metadata: '{"type":"cdn","label":"Testing Backend","apiEndpoint":"http:localhost:5000/","bandwidthLimit":{"amount":1,"unit":"tb","period":"monthly"},"autoSsl":true,"burstSpeed":1000,"nodeLocations":["ABB"],"customCnames":true}'
  },
  status: {
    active: true,
    createdAt: 1710153976n,
    acceptedAt: 1710153976n,
    billingStart: 1710153976n,
    cancelled: false,
    cancelledAt: 0n
  }
}

const mockResource = {
  id: 3n,
  owner: '0x2C0BE604Bd7969162aA72f23dA18634a77aFBB31',
  label: 'Testing Backend',
  protocol: 'http',
  origin: 'localhost',
  path: '/var/www/html',
}

beforeAll(async () => {
  await resetDB()
});

/*afterAll(async () => {
  await Deal.drop();
  await Resource.drop();
})*/

describe('Deal Controller', () => {

  test('should create or update a deal', async () => {

    await ResourcesController.upsertResource(mockResource)

    const formattedDeal = DealsController.formatDeal(mockDeal)

    const result = await DealsController.upsertDeal(formattedDeal)

    expect(result.deal).not.toBeNull()
  });

  test("get deal", async () => {
    const nullDeal = await DealsController.getDealById('2')

    expect(nullDeal).toBeNull()

    const deal = await DealsController.getDealById('1')

    // @ts-ignore
    expect(deal.id).toBe(1)
  })

  test("delete deal", async () => {
    const nullDeal = await DealsController.deleteDealById(2)

    expect(nullDeal).toBeNull()

    const deal = await DealsController.deleteDealById(1)

    // @ts-ignore
    expect(deal.id).toBe(1)
  })
});
