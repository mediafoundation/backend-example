import {DataTypes} from "sequelize";
import {sequelize} from "../../database";
import {array, boolean, number, object, string, z} from "zod";

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

export const OffersMetadataType = z.object({
    label: string(),
    bandwidthLimit: object({
        amount: number(),
        period: string(),
        unit: string()
    }),
    autoSsl: boolean(),
    burstSpeed: number(),
    nodeLocations: array(string()),
    apiEndpoint: string(),
    customCnames: boolean()
})