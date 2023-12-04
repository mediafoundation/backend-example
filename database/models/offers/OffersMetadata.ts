import {DataTypes} from "sequelize";
import {sequelize} from "../../database";

export const OffersMetadata = sequelize.define("Offers",
    {
        id: {type: DataTypes.BIGINT, primaryKey: true},
        offerId: {
            type: DataTypes.BIGINT,
            references: {
                model: 'Offers',
                key: 'id'
            }
        },
        label: DataTypes.STRING,
        bandwidthLimitId: {
            type: DataTypes.BIGINT,
            references: {
                model: 'OffersBandwidthLimit',
                key: 'id'
            }
        },
        autoSsl: DataTypes.BOOLEAN,
        burstSpeed: DataTypes.BIGINT,
        nodeLocations: DataTypes.STRING,
        apiEndpoint: DataTypes.STRING,
        customCnames: DataTypes.STRING,
    },
    {
        modelName: 'Deal',
        freezeTableName: true
    }
);