### This models section will provide a description of each model and its schema
### Each of the attributes can be used to filter based on the api request. See [api filters documentation](../../README.md#filters) form more information

### Chain
The chain model represents every chain supported by the marketplace, it's referenced by [resources](#resource), [deals](#deal) and [offers](#offer)

```typescript
export class Chain {
  declare chainId: number //Also, the primary key
  declare name: string
}
```

### Resource
```typescript
export class Resource {
  declare id: CreationOptional<number>
  declare resourceId: number
  declare owner: string
  declare encryptedData: string
  declare encryptedSharedKey: string
  declare chainId: ForeignKey<Chain["chainId"]>
}
```

### Deal
The base deal structure

```typescript
export class Deal {
  declare id: CreationOptional<number> // To be autoincrement 
  declare dealId: number
  declare resourceId: ForeignKey<Resource["id"]> | null
  declare chainId: ForeignKey<Chain["chainId"]>
  declare client: ForeignKey<Client["account"]>
  declare provider: ForeignKey<Provider["account"]>
  declare totalPayment: number
  declare blockedBalance: number
  declare pricePerSecond: number
  declare minDealDuration: number
  declare billFullPeriods: boolean
  declare singlePeriodOnly: boolean
  declare createdAt: number
  declare acceptedAt: number
  declare billingStart: number
  declare active: boolean
  declare cancelled: boolean
  declare cancelledAt: number
}
```

### DealsMetadata

```typescript
export class DealMetadata {
  declare id: CreationOptional<number> // To be autoincrement
  declare dealId: ForeignKey<Deal["id"]>
  declare type: string
  declare label: string
  declare autoSsl: boolean
  declare burstSpeed: number
  declare apiEndpoint: string
  declare customCnames: boolean
}
```

### Offer
```typescript
export class Offer {
  declare id: CreationOptional<number>
  declare offerId: number
  declare provider: ForeignKey<Provider["account"]>
  declare chainId: ForeignKey<Chain["chainId"]>
  declare publicKey: string
  declare maximumDeals: number
  declare autoAccept: boolean
  declare pricePerSecond: number
  declare minDealDuration: number
  declare billFullPeriods: boolean
  declare singlePeriodOnly: boolean
}
```

### OffersMetadata
```typescript
export class OfferMetadata {
  declare id: CreationOptional<number>
  declare offerId: ForeignKey<Offer["id"]>
  declare type: string
  declare label: string
  declare autoSsl: boolean
  declare burstSpeed: number
  declare apiEndpoint: string
}
```

### BandwidthLimit
It has either a dealMetadata or an offerMetadata.

```typescript
export class BandwidthLimit {
  declare id: CreationOptional<number> // To be autoincrement
  declare dealMetadataId: CreationOptional<ForeignKey<DealMetadata["id"]>> // Null if it's for an offer
  declare offerMetadataId: CreationOptional<ForeignKey<OfferMetadata["id"]>> // Null if it's for a deal
  declare amount: number
  declare period: string
  declare unit: string
}
```

### Provider
Referenced by [deals](#deal) and [offers](#offer)
```typescript
export class Provider {
  declare account: string //Also, the primary key
}
```

### Client
Referenced only by [deals](#deal)
```typescript
export class Client {
  declare account: string //Also, the primary key
}
```