import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {NodeLocation} from "../NodeLocation"
import {sequelize} from "../../database"
import {Offer} from "../offers/Offer"

export class OfferNodeLocation extends Model<InferAttributes<OfferNodeLocation>, InferCreationAttributes<OfferNodeLocation>> {
  declare id: CreationOptional<number>
  declare offerId: ForeignKey<Offer["id"]>
  declare location: ForeignKey<NodeLocation["location"]>
}

OfferNodeLocation.init({
  id: {type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
}, {
  sequelize,
  timestamps: false
})