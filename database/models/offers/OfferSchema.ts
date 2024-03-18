import { z } from "zod"

export const offerSchema = z.object({
  id: z.number(),
  maximumDeals: z.number(),
  pricePerSecond: z.bigint(),
  billFullPeriods: z.boolean(),
  provider: z.string(),
  autoAccept: z.boolean(),
  minDealDuration: z.number(),

  // metadata
  label: z.string(),
  nodeLocations: z.string().array().nonempty(),
  autoSsl: z.boolean(),
  customCnames: z.boolean(),
  burstSpeed: z.number(),
  bandwidthLimit: z.string(),
})