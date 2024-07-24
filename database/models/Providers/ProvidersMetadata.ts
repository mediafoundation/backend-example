import {DataTypes, ForeignKey, Model} from "sequelize"
import {Provider} from "./Provider"
import {sequelize} from "../../database"

export type ProvidersMetadataType = {
  id: number,
  provider: ForeignKey<Provider["account"]>,
  metadata: string
  chainId: number
}

export class ProvidersMetadata extends Model<ProvidersMetadataType, ProvidersMetadataType> {
  declare id: number
  declare provider: ForeignKey<Provider["account"]>
  declare metadata: string
  declare chainId: number
}

ProvidersMetadata.init({
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  metadata: DataTypes.STRING,
  chainId: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
})