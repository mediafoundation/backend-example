import {DataTypes} from "sequelize";
import {getSequelizeInstance} from "../../config/config";

let sequelizeInstance = getSequelizeInstance()


export const Offer = sequelizeInstance.define("Offers",
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
    modelName: 'Deal',
    freezeTableName: true
  }
);
