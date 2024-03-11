import {DataTypes} from "sequelize";
import {sequelize} from "../../database";


export const Offer = sequelize.define("Offers",
    {
        id: {type: DataTypes.BIGINT, primaryKey: true},
        maximumDeals: DataTypes.BIGINT,
        pricePerSecond: DataTypes.BIGINT,
        billFullPeriods: DataTypes.BOOLEAN,
        provider: DataTypes.STRING,
        autoAccept: DataTypes.BOOLEAN,
        minDealDuration: DataTypes.INTEGER,
    },
    {
        modelName: 'Deal',
        freezeTableName: true
    }
);
