import {
  DataTypes,
  Model,
  HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin,
  ForeignKey,
  BelongsToManyGetAssociationsMixin,
  CreationOptional, NonAttribute, InferCreationAttributes,
} from "sequelize"
import {DECIMALS_DIGITS, sequelize} from "../../database"
import {DealMetadata} from "./DealsMetadata"
import {NodeLocation} from "../NodeLocation"
import {Resource} from "../Resource"
import {Client} from "../Clients/Client"
import {Provider} from "../Providers/Provider"
import {Chain} from "../Chain"
import {Offer} from "../offers/Offer"

export type DealAttributes = {
  id: number
  dealId: number
  offerId: ForeignKey<Offer["id"]>
  resourceId: ForeignKey<Resource["id"]> | null
  chainId: ForeignKey<Chain["chainId"]>
  client: ForeignKey<Client["account"]>
  provider: ForeignKey<Provider["account"]>
  totalPayment: number
  blockedBalance: number
  pricePerSecond: number
  minDealDuration: number
  billFullPeriods: boolean
  singlePeriodOnly: boolean
  createdAt: number
  acceptedAt: number
  billingStart: number
  active: boolean
  cancelled: boolean
  cancelledAt: number
  
  NodeLocations?: NodeLocation[]
}

//type DealCreationAttributes = Optional<DealAttributes, "id">

export class Deal extends Model<DealAttributes, InferCreationAttributes<Deal>> {
  declare id: CreationOptional<number>
  declare dealId: number
  declare offerId: ForeignKey<Offer["id"]>
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

  declare NodeLocations: NonAttribute<NodeLocation[] | undefined>

  declare getMetadata: HasOneGetAssociationMixin<DealMetadata>
  declare createMetadata: HasOneCreateAssociationMixin<DealMetadata>

  declare getNodeLocations: BelongsToManyGetAssociationsMixin<NodeLocation>
}

Deal.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  dealId: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
  totalPayment: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
  blockedBalance: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
  pricePerSecond: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
  minDealDuration: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
  billFullPeriods: DataTypes.BOOLEAN,
  singlePeriodOnly: DataTypes.BOOLEAN,
  createdAt: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
  acceptedAt: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
  billingStart: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
  active: DataTypes.BOOLEAN,
  cancelled: DataTypes.BOOLEAN,
  cancelledAt: DataTypes.DECIMAL(DECIMALS_DIGITS, 0)
}, {
  sequelize,
  timestamps: false
})