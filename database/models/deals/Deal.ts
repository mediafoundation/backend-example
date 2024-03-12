import {
    Association,
    DataTypes,
    Model,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
    HasOneGetAssociationMixin,
    HasOneCreateAssociationMixin,
} from 'sequelize';
import {DECIMALS_DIGITS, sequelize} from "../../database";

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

export class DealMetadata extends Model<
  InferAttributes<DealMetadata>,
  InferCreationAttributes<DealMetadata>
>{
    declare id: CreationOptional<number>;
    declare dealId: ForeignKey<Deal['id']>
    declare type: string;
    declare label: string;
    declare autoSsl: boolean;
    declare burstSpeed: number;
    declare apiEndpoint: string;
    declare customCnames: boolean;
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
    tableName: 'deals'
})

DealMetadata.init({
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    type: DataTypes.STRING,
    label: DataTypes.STRING,
    autoSsl: DataTypes.BOOLEAN,
    burstSpeed: DataTypes.NUMBER,
    apiEndpoint: DataTypes.STRING,
    customCnames: DataTypes.BOOLEAN
}, {
    sequelize,
    tableName: 'deals_metadata'
})