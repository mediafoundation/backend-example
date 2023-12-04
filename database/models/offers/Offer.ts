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
        metadataId: {
            type: DataTypes.BIGINT,
            references: {
                model: 'OffersMetadata',
                key: 'id'
            }
        }
    },
    {
        modelName: 'Deal',
        freezeTableName: true
    }
);
