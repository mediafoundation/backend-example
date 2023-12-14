import {DataTypes} from "sequelize";
import {sequelize} from "../../database";
import {array, boolean, number, object, string, z} from "zod";
import {DealsBandwidthLimit} from "./DealsBandwidthLimit";

export const DealsMetadata = sequelize.define("DealsMetadata", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    label: DataTypes.STRING,
    bandwidthLimitId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'DealsBandwidthLimit',
            key: 'id'
        },
        allowNull: false,
    },
    autoSsl: DataTypes.BOOLEAN,
    burstSpeed: DataTypes.BIGINT,
    apiEndpoint: DataTypes.STRING,
    customCnames: DataTypes.STRING,
}, {
    modelName: 'DealsMetadata',
    freezeTableName: true
});

DealsMetadata.belongsTo(DealsBandwidthLimit, {
    foreignKey: 'bandwidthLimitId',
    as: "BandwidthLimit"
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