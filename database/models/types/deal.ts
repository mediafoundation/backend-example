import { z } from "zod";

export const MetadataSchema = z.object({
  type: z.string(),
  label: z.string(),
  apiEndpoint: z.string(),
  bandwidthLimit: z.object({
    amount: z.number(),
    unit: z.string(),
    period: z.string(),
  }),
  autoSsl: z.boolean(),
  burstSpeed: z.number(),
  nodeLocations: z.array(z.string()),
  customCnames: z.boolean(),
});

export type DealTransformed = {
  id: number;
  offerId: bigint;
  client: string;
  provider: string;
  resourceId: bigint;
  totalPayment: bigint;
  blockedBalance: bigint;

  pricePerSecond: bigint;
  minDealDuration: bigint;
  billFullPeriods: boolean;
  singlePeriodOnly: boolean;
  metadata: string;


  active: boolean;
  createdAt: bigint;
  acceptedAt: bigint;
  billingStart: bigint;
  cancelled: boolean;
  cancelledAt: bigint;

};

export type DealFormatted = {
  id: string;
  offerId: number;
  client: string;
  provider: string;
  resourceId: string;
  totalPayment: number;
  blockedBalance: number;

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

  active: boolean;
  createdAt: number;
  acceptedAt: number;
  billingStart: number;
  cancelled: boolean;
  cancelledAt: number;

  network: string;
}

export type DealRawType = z.infer<typeof DealRawSchema>;

export const DealRawSchema = z.object({
  id: z.number(),
  offerId: z.bigint(),
  client: z.string(),
  provider: z.string(),
  resourceId: z.bigint(),
  totalPayment: z.bigint(),
  blockedBalance: z.bigint(),
  terms: z.object({
    pricePerSecond: z.bigint(),
    minDealDuration: z.bigint(),
    billFullPeriods: z.boolean(),
    singlePeriodOnly: z.boolean(),
    metadata: z.string(),
  }),
  status: z.object({
    active: z.boolean(),
    createdAt: z.bigint(),
    acceptedAt: z.bigint(),
    billingStart: z.bigint(),
    cancelled: z.boolean(),
    cancelledAt: z.bigint(),
  }),
});