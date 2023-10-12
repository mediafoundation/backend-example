import {DataTypes} from "sequelize";
import {sequelize} from "../database";


export const Offer = sequelize.define("Offers",
  {
    id: {type: DataTypes.STRING, primaryKey: true},
    maximumDeals: DataTypes.INTEGER,
    pricePerSecond: DataTypes.BIGINT,
    billFullPeriods: DataTypes.BOOLEAN,
    provider: DataTypes.STRING,
    autoAccept: DataTypes.BOOLEAN,
    minDealDuration: DataTypes.INTEGER,

    // metadata
    label: DataTypes.STRING,
    nodeLocations: DataTypes.STRING,
    autoSsl: DataTypes.BOOLEAN,
    customCnames: DataTypes.BOOLEAN,
    burstSpeed: DataTypes.INTEGER,
    bandwidthLimit: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: 'Deal',
    freezeTableName: true
  }
);
