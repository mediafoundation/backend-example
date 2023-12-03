import {DataTypes} from "sequelize";
import {sequelize} from "../database";

export const Deal = sequelize.define("Deals",
  {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    offerId: DataTypes.BIGINT,
    client: DataTypes.STRING,
    provider: DataTypes.STRING,
    resourceId: DataTypes.BIGINT,
    totalPayment: DataTypes.BIGINT,
    blockedBalance: DataTypes.BIGINT,
    pricePerSecond: DataTypes.BIGINT,
    minDuration: DataTypes.BIGINT,
    billFullPeriods: DataTypes.BOOLEAN,
    singlePeriodOnly: DataTypes.BOOLEAN,
    createdAt: DataTypes.BIGINT,
    acceptedAt: DataTypes.BIGINT,
    billingStart: DataTypes.BIGINT,
    active: DataTypes.BOOLEAN,
    cancelled: DataTypes.BOOLEAN,
    cancelledAt: DataTypes.BIGINT,
    metadata: DataTypes.STRING,
    network: DataTypes.STRING
  },
  {
    modelName: 'Deal',
    freezeTableName: true
  }
);
