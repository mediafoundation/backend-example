import {
  DataTypes, HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize";
import {sequelize} from "../database";
import {Deal} from "./deals/Deal";
import {DealMetadata} from "./deals/DealsMetadata";

/*
export const Resource= sequelize.define("Resources",
    {
        id: {type: DataTypes.BIGINT, primaryKey: true},
        owner: DataTypes.STRING,
        label: DataTypes.STRING,
        protocol: DataTypes.STRING,
        origin: DataTypes.STRING,
        path: DataTypes.STRING,
        domain: DataTypes.STRING,
        network: DataTypes.STRING,
    },
    {
        modelName: 'Resource',
        freezeTableName: true
    }
);
*/

export class Resource extends Model<InferAttributes<Resource>, InferCreationAttributes<Resource>> {
  declare id: string;
  declare owner: string;
  declare label: string;
  declare protocol: string;
  declare origin: string;
  declare path: string;
  declare domain: string;
  declare network: string;
}

Resource.init({
  id: {type: DataTypes.BIGINT, primaryKey: true},
  owner: DataTypes.STRING,
  label: DataTypes.STRING,
  protocol: DataTypes.STRING,
  origin: DataTypes.STRING,
  path: DataTypes.STRING,
  domain: DataTypes.STRING,
  network: DataTypes.STRING
}, {
  sequelize,
  timestamps: false,
  freezeTableName: true
});