import {DataTypes, ForeignKey, InferCreationAttributes, Model} from "sequelize"
import {Client} from "./Client"
import {sequelize} from "../../database"

interface ClientsMetadataType {
  id?: number
  client: string
  metadata: string
  chainId: number
}

export class ClientsMetadata extends Model<ClientsMetadataType, InferCreationAttributes<ClientsMetadata>> {
  declare id: number
  declare client: ForeignKey<Client>
  declare metadata: string
  declare chainId: number
}

ClientsMetadata.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  client: {
    type: DataTypes.STRING,
    references: {
      model: Client,
      key: "account"
    }
  },
  metadata: DataTypes.TEXT,
  chainId: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ["client", "chainId"]
    }
  ]
})