import {DataTypes} from "sequelize";
import {sequelize} from "../../database";

export const OffersMetadata = sequelize.define("OffersMetadata",
    {
        id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
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
        apiEndpoint: DataTypes.STRING,
        customCnames: DataTypes.STRING,
    },
    {
        modelName: 'OffersMetadata',
        freezeTableName: true
    }
);