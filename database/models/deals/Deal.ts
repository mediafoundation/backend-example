import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  HasOneGetAssociationMixin,
  HasOneCreateAssociationMixin,
  ForeignKey,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  CreationOptional,
} from "sequelize"
import {DECIMALS_DIGITS, sequelize} from "../../database"
import {DealMetadata} from "./DealsMetadata"
import {NodeLocation} from "../NodeLocation"
import {Resource} from "../Resource"
import {Client} from "../Client"
import {Provider} from "../Provider"
import {Chain} from "../Chain"

export class Deal extends Model<InferAttributes<Deal>, InferCreationAttributes<Deal>> {
  declare id: CreationOptional<number>
  declare dealId: number
  declare resourceId: ForeignKey<Resource["id"]> | null
  declare chainId: ForeignKey<Chain["chainId"]>
  declare clientId: ForeignKey<Client["id"]>
  declare providerId: ForeignKey<Provider["id"]>
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

  declare getMetadata: HasOneGetAssociationMixin<DealMetadata>
  declare createMetadata: HasOneCreateAssociationMixin<DealMetadata>

  declare getNodeLocations: BelongsToManyGetAssociationsMixin<NodeLocation>
  declare createNodeLocation: BelongsToManyCreateAssociationMixin<NodeLocation>
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