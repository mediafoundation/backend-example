import {DataTypes} from "sequelize";
import {sequelize} from "../../database";
import {array, boolean, number, object, string, z} from "zod";
import {DealsBandwidthLimit} from "./DealsBandwidthLimit";
import {Deal} from "./Deal";

export const DealsMetadata = sequelize.define("DealsMetadata", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    dealId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Deals',
            key: 'id'
        }
    },
    label: DataTypes.STRING,
    autoSsl: DataTypes.BOOLEAN,
    burstSpeed: DataTypes.BIGINT,
    apiEndpoint: DataTypes.STRING,
    customCnames: DataTypes.STRING,
}, {
    modelName: 'DealsMetadata',
    freezeTableName: true
});

export const DealsMetadataType = z.object({
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