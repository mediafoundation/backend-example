import {DataTypes} from "sequelize";
import {sequelize} from "../../database";
import {DealsMetadata} from "./DealsMetadata";

export const Deal = sequelize.define("Deals",
  {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    offerId: DataTypes.BIGINT,
    clientId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Clients',
            key: 'id'
        }
    },
    providerId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Providers',
            key: 'id'
        }
    },
    resourceId: {
        type: DataTypes.BIGINT,
        references: {
            model: 'Resources',
            key: 'id'
        }
    },
    totalPayment: DataTypes.BIGINT,
    blockedBalance: DataTypes.BIGINT,
    pricePerSecond: DataTypes.BIGINT,
    minDuration: DataTypes.BIGINT,
    billFullPeriods: DataTypes.BOOLEAN,
    singlePeriodOnly: DataTypes.BOOLEAN,
    createdAt: DataTypes.BIGINT,
    acceptedAt: DataTypes.BIGINT,
    billingStart: DataTypes.BIGINT,
    active: DataTypes.BOOLEAN,
    cancelled: DataTypes.BOOLEAN,
    cancelledAt: DataTypes.BIGINT,
    network: DataTypes.STRING
  },
  {
    modelName: 'Deal',
    freezeTableName: true
  }
);

/*export type FormattedDeal = {
    id: number,
    offerId: number,
    client: string,
    provider: string,
    resourceId: number,
    totalPayment: number,
    blockedBalance: number,
    pricePerSecond: number,
    minDuration: number,
    billFullPeriods: boolean,
    singlePeriodOnly: boolean,
    createdAt: number,
    acceptedAt: number,
    billingStart: number,
    active: boolean,
    cancelled: boolean,
    cancelledAt: number,
    metadata: string,
}*/

/*export type ExtendedDeal = FormattedDeal & {
  clientId?: number,
  providerId?: number,
  resourceId?: number,
  metadataId?: number,
}*/
