import {
  BelongsToManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin,
  DataTypes,
  ForeignKey, HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  Model
} from "sequelize";
import {sequelize} from "../../database";
import {Provider} from "../Provider";
import {OfferMetadata} from "./OffersMetadata";
import {BandwidthLimit} from "../BandwidthLimit";
import {NodeLocation} from "../NodeLocation";

export class Offer extends Model<InferAttributes<Offer>, InferCreationAttributes<Offer>> {
  declare id: string;
  declare providerId: ForeignKey<Provider>
  declare publicKey: string;
  declare maximumDeals: number;
  declare autoAccept: boolean;
  declare pricePerSecond: number;
  declare minDealDuration: number;
  declare billFullPeriods: boolean;
  declare singlePeriodOnly: boolean;
  declare network: string;

  declare getMetadata: HasOneGetAssociationMixin<OfferMetadata>;
  declare createMetadata: HasOneCreateAssociationMixin<OfferMetadata>;

  declare getBandwidthLimit: HasOneGetAssociationMixin<BandwidthLimit>;
  declare createBandwidthLimit: HasOneCreateAssociationMixin<BandwidthLimit>;

  declare getNodeLocations: BelongsToManyGetAssociationsMixin<NodeLocation>
  declare createNodeLocation: BelongsToManyCreateAssociationMixin<NodeLocation>

  declare setProvider: HasOneCreateAssociationMixin<Provider>;
}

Offer.init({
  id: {type: DataTypes.BIGINT, primaryKey: true},
  publicKey: DataTypes.STRING,
  maximumDeals: DataTypes.BIGINT,
  autoAccept: DataTypes.BOOLEAN,
  pricePerSecond: DataTypes.BIGINT,
  minDealDuration: DataTypes.INTEGER,
  billFullPeriods: DataTypes.BOOLEAN,
  singlePeriodOnly: DataTypes.BOOLEAN,
  network: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'Offer',
  freezeTableName: true
})