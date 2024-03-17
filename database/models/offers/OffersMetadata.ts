import {DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model} from "sequelize";
import {sequelize} from "../../database";
import {Offer} from "./Offer";

export class OfferMetadata extends Model<InferAttributes<OfferMetadata>, InferCreationAttributes<Offer>> {
  declare id: string;
  declare offerId: ForeignKey<Offer['id']>;
  declare type: string;
  declare label: string;
  declare autoSsl: boolean;
  declare burstSpeed: number;
  declare apiEndpoint: string;
}

OfferMetadata.init({
  id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
  type: DataTypes.STRING,
  label: DataTypes.STRING,
  autoSsl: DataTypes.BOOLEAN,
  burstSpeed: DataTypes.INTEGER,
  apiEndpoint: DataTypes.STRING,
}, {
  sequelize,
  timestamps: false,
})