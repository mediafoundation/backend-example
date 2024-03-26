import {z} from "zod"

export const OfferMetadataSchema = z.object({
  type: z.string(),
  label: z.string(),
  apiEndpoint: z.string(),
  bandwidthLimit: z.object({
    amount: z.number(),
    unit: z.string(),
    period: z.string()
  }),
  autoSsl: z.boolean(),
  burstSpeed: z.number(),
  nodeLocations: z.array(z.string()).min(1),
  customCnames: z.boolean()
})

export type OfferTransformed = {
  id: number;
  provider: string;
  publicKey: string;
  maximumDeals: number;
  autoAccept: boolean;
  pricePerSecond: number;
  minDealDuration: number;
  billFullPeriods: boolean;
  singlePeriodOnly: boolean;
  metadata: string;
}

export type OfferFormatted = {
  offerId: number;
  provider: string;
  publicKey: string;
  maximumDeals: number;
  autoAccept: boolean;
  pricePerSecond: number;
  minDealDuration: number;
  billFullPeriods: boolean;
  singlePeriodOnly: boolean;
  metadata: {
    type: string;
    label: string;
    apiEndpoint: string;
    bandwidthLimit: {
      amount: number;
      unit: string;
      period: string;
    };
    autoSsl: boolean;
    burstSpeed: number;
    nodeLocations: string[];
    customCnames: boolean;
  };
};

export const OfferRawSchema = z.object({
  id: z.bigint(),
  provider: z.string(),
  publicKey: z.string(),
  maximumDeals: z.bigint(),
  autoAccept: z.boolean(),
  terms: z.object({
    pricePerSecond: z.bigint(),
    minDealDuration: z.bigint(),
    billFullPeriods: z.boolean(),
    singlePeriodOnly: z.boolean(),
    metadata: z.string()
  })
})
