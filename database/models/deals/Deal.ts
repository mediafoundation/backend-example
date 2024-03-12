import {
    Association,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    HasOneGetAssociationMixin,
    HasOneCreateAssociationMixin,
} from 'sequelize';
import {DECIMALS_DIGITS, sequelize} from "../../database";
import {DealMetadata} from "./DealsMetadata";

export class Deal extends Model<InferAttributes<Deal>, InferCreationAttributes<Deal>> {
    declare id: string;
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

    declare static associations: {
        metadata: Association<Deal, DealMetadata>
    };
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
    sequelize
})