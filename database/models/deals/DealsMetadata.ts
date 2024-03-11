import {DataTypes} from "sequelize";
import {DECIMALS_DIGITS, sequelize} from "../../database";
import {array, boolean, number, object, string, z} from "zod";

export const DealsMetadata = sequelize.define("DealsMetadata", {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    type: DataTypes.STRING,
    label: DataTypes.STRING,
    autoSsl: DataTypes.BOOLEAN,
    burstSpeed: DataTypes.DECIMAL(DECIMALS_DIGITS, 0),
    apiEndpoint: DataTypes.STRING,
    customCnames: DataTypes.STRING,
}, {
    freezeTableName: true
});

export const DealsMetadataType = z.object({
    type: string(),
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