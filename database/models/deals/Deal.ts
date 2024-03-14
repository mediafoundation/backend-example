import {
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    HasOneGetAssociationMixin,
    HasOneCreateAssociationMixin,
    ForeignKey,
    HasManyGetAssociationsMixin,
    HasManyCreateAssociationMixin,
    BelongsToCreateAssociationMixin,
} from 'sequelize';
import {DECIMALS_DIGITS, sequelize} from "../../database";
import {DealMetadata} from "./DealsMetadata";
import {BandwidthLimit} from "../BandwidthLimit";
import {NodeLocation} from "../NodeLocation";
import {Resource} from "../Resource";
import {Client} from "../Client";
import {Provider} from "../Provider";

export class Deal extends Model<InferAttributes<Deal>, InferCreationAttributes<Deal>> {
    declare id: string;
    declare resourceId: ForeignKey<Resource['id']>;
    declare client: ForeignKey<Client['account']>;
    declare provider: ForeignKey<Provider['account']>;
    declare totalPayment: number;
    declare blockedBalance: number;
    declare pricePerSecond: number;
    declare minDealDuration: number;
    declare billFullPeriods: boolean;
    declare singlePeriodOnly: boolean;
    declare createdAt: number;
    declare acceptedAt: number;
    declare billingStart: number;
    declare active: boolean;
    declare cancelled: boolean;
    declare cancelledAt: number;
    declare network: string;

    declare getMetadata: HasOneGetAssociationMixin<DealMetadata>;
    declare createMetadata: HasOneCreateAssociationMixin<DealMetadata>;

    declare getBandwidthLimit: HasOneGetAssociationMixin<BandwidthLimit>
    declare createBandwidthLimit: HasOneCreateAssociationMixin<BandwidthLimit>

    declare getNodeLocations: HasManyGetAssociationsMixin<NodeLocation>
    declare createNodeLocation: HasManyCreateAssociationMixin<NodeLocation>

    declare setResource: BelongsToCreateAssociationMixin<Resource>

    declare setClient: BelongsToCreateAssociationMixin<Client>

    declare setProvider: BelongsToCreateAssociationMixin<Provider>
}




Deal.init({
    id: {type: DataTypes.STRING, primaryKey: true},
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
    cancelledAt: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
    network: DataTypes.STRING
}, {
    sequelize,
    timestamps: false
})