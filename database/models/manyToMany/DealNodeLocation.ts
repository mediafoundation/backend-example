import {CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize"
import {Deal} from "../deals/Deal"
import {NodeLocation} from "../NodeLocation"
import {sequelize} from "../../database"

export class DealNodeLocation extends Model<InferAttributes<DealNodeLocation>, InferCreationAttributes<DealNodeLocation>> {
  declare id: CreationOptional<number>
  declare dealId: ForeignKey<Deal["id"]>
  declare location: ForeignKey<NodeLocation["location"]>
}

DealNodeLocation.init({
  id: {type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
}, {
  sequelize,
  timestamps: false
})