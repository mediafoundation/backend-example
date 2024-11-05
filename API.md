# API

### This section will cover every aspect that is needed to use the backend-example's API and its endpoint.

## Glossary

**Active clients**
> Clients who have at least one active deal with the given provider.

## Endpoints

### 1. Retrieve all resources

#### GET /resources

#### Request Parameters

| Name      | Type  | Description                                                                                          |
|-----------|-------|------------------------------------------------------------------------------------------------------|
| `chainId` | `int` | The chain ID from where resources must be fetched. If not provided, it will bring from all networks. |

### 2. Retrieves deals based on provided filters, page number and page size.

#### GET /deals

#### Request Parameters

| Name       | Type     | Description                                                                                                                                                            |
|------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `chainId`  | `int`    | (Optional) The chain ID from where deals must be fetched. If not provided, it will bring from all networks.                                                            |
| `filters`  | `object` | (Optional) The filter object containing all filters that must be applied to the query. For more information, see the [API filters documentation](./README.md#filters). |
| `page`     | `int`    | (Optional) The page number used in pagination. If not provided, it will bring all elements that matches the filters.                                                   |
| `pageSize` | `int`    | (Optional) The number of elements contained in each page. If not provided, it will bring all elements that matches the filters.                                        |

### 3. Retrieves offers based on provided filters, page number and page size.

#### GET /offers

#### Request Parameters

| Name        | Type     | Description                                                                                                                                                            |
|-------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `chainId`   | `int`    | (Optional) The chain ID from where offers must be fetched. If not provided, it will bring from all networks.                                                           |
| `filters`   | `object` | (Optional) The filter object containing all filters that must be applied to the query. For more information, see the [API filters documentation](./README.md#filters). |
| `minRating` | `number` | (Optional) The average min rating that the offer's provider must have. It can be used along side with every other filter                                               |
| `page`      | `int`    | (Optional) The page number used in pagination. If not provided, it will bring all elements that matches the filters.                                                   |
| `pageSize`  | `int`    | (Optional) The number of elements contained in each page. If not provided, it will bring all elements that matches the filters.                                        |

### 3. Retrieves providers based on provided filters, page number and page size.

#### GET /providers

#### Request Parameters

| Name       | Type     | Description                                                                                                                                                            |
|------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `chainId`  | `int`    | (Optional) The chain ID from where offers must be fetched. If not provided, it will bring from all networks.                                                           |
| `filters`  | `object` | (Optional) The filter object containing all filters that must be applied to the query. For more information, see the [API filters documentation](./README.md#filters). |
| `page`     | `int`    | (Optional) The page number used in pagination. If not provided, it will bring all elements that matches the filters.                                                   |
| `pageSize` | `int`    | (Optional) The number of elements contained in each page. If not provided, it will bring all elements that matches the filters.                                        |


### 4. Retrieves provider's new deals created on a time range

#### GET /providers/countNewDeals

#### Request Parameters

| Name       | Type     | Description                                                                                            |
|------------|----------|--------------------------------------------------------------------------------------------------------|
| `chainId`  | `int`    | (Required) The chain ID from where deals must be counted.                                              |
| `provider` | `string` | (Required) The provider of deals that will be counted.                                                 |
| `from`     | `int`    | (Optional) The start time from where to start counting deals. Must be unix time, expressed in seconds. |
| `to`       | `int`    | (Optional) The time where count must be stopped. Must be unix time, expressed in seconds.              |


### 5. Retrieves provider's total revenue on a marketplace

#### GET /providers/totalRevenue

#### Request Parameters

| Name       | Type     | Description                                                                               |
|------------|----------|-------------------------------------------------------------------------------------------|
| `chainId`  | `int`    | (Required) The chain ID from where revenue will be calculated.                            |
| `provider` | `string` | (Required) The provider from which want to get the revenue.                               |
| `from`     | `int`    | (Optional) The start time from where to start calculating revenue.                        |
| `to`       | `int`    | (Optional) The time where count must be stopped. Must be unix time, expressed in seconds. |


### 6. Retrieves provider's partial revenue on a marketplace
#### GET /providers/partialRevenue
#### Request Parameters

| Name       | Type     | Default Value | Description                                                                                                 |
|------------|----------|:-------------:|-------------------------------------------------------------------------------------------------------------|
| `chainId`  | `int`    |       -       | (Required) The chain ID from where revenue will be calculated.                                              |
| `provider` | `string` |       -       | (Required) The provider from which want to get the revenue.                                                 |
| `from`     | `int`    |       0       | (Optional) The start time from where to start calculating revenue. Must be unix time, expressed in seconds. |
| `to`       | `int`    | Current time  | (Optional) The time where count must be stopped. Must be unix time, expressed in seconds.                   |


### 7. Retrieves the count of new clients for a provider in a certain time range

#### GET /providers/countNewClients

### Request Parameters

| Name       | Type     | Default value | Description                                                                                                 |
|------------|----------|:-------------:|-------------------------------------------------------------------------------------------------------------|
| `chainId`  | `int`    |       -       | (Required) The chain ID from where clients will be count.                                                   |
| `provider` | `string` |       -       | (Required) The provider from which want count new clients.                                                  |
| `from`     | `int`    |       0       | (Optional) The start time from where to start calculating revenue. Must be unix time, expressed in seconds. |
| `to`       | `int`    | Current time  | (Optional) The time where count must be stopped. Must be unix time, expressed in seconds.                   |


### 8. Retrieves the count of active clients for a provider in a certain time range

#### GET /providers/countActiveClients

### Request Parameters

| Name       | Type     | Default value | Description                                                                                                 |
|------------|----------|:-------------:|-------------------------------------------------------------------------------------------------------------|
| `chainId`  | `int`    |       -       | (Required) The chain ID from where clients will be count.                                                   |
| `provider` | `string` |       -       | (Required) The provider from which want count active clients.                                               |
| `from`     | `int`    |       0       | (Optional) The start time from where to start calculating revenue. Must be unix time, expressed in seconds. |
| `to`       | `int`    | Current time  | (Optional) The time where count must be stopped. Must be unix time, expressed in seconds.                   |

### 9. Retrieves deal details for a specific provider and client.

#### GET /providersClient

#### Request Parameters

| Name       | Type     | Description                                               |
|------------|----------|-----------------------------------------------------------|
| `provider` | `string` | (Required) The provider from which want to get the deals. |
| `client`   | `string` | (Required) The client from which want to get the deals.   |


### 10. Retrieves all clients and their deals for a specific provider across all chains.

#### GET /allProvidersClients

#### Request Parameters

| Name       | Type     | Description                                               |
|------------|----------|-----------------------------------------------------------|
| `provider` | `string` | (Required) The provider from which want to get the deals. |


### 11. Insert or update an offer in the database.

#### GET /upsertOffer

#### Request Parameters

| Name      | Type  | Description                                                          |
|-----------|-------|----------------------------------------------------------------------|
| `chainId` | `int` | (Required) The chain ID where the offer will be inserted or updated. |
| `offerId` | `int` | (Required) The offer ID                                              |


### 12. Insert or update a deal in the database.

#### GET /upsertDeal

#### Request Parameters

| Name      | Type  | Description                                                         |
|-----------|-------|---------------------------------------------------------------------|
| `chainId` | `int` | (Required) The chain ID where the deal will be inserted or updated. |
| `dealId`  | `int` | (Required) The deal ID                                              |


### 13. Insert or update a resource in the database.

#### GET /upsertResource

#### Request Parameters

| Name         | Type     | Description                                                             |
|--------------|----------|-------------------------------------------------------------------------|
| `chainId`    | `int`    | (Required) The chain ID where the resource will be inserted or updated. |
| `resourceId` | `int`    | (Required) The resource ID                                              |
| `address`    | `string` | (Required) The resource's owner address                                 |


### 14. Insert or update a provider in the database.

#### GET /upsertProvider

#### Request Parameters

| Name       | Type     | Description                                                             |
|------------|----------|-------------------------------------------------------------------------|
| `chainId`  | `int`    | (Required) The chain ID where the provider will be inserted or updated. |
| `provider` | `int`    | (Required) The provider address                                         |

### 15. Retrieves event logs for a specific account and chain ID.

#### GET /account/events

#### Request Parameters

| Name       | Type     | Description                                                    |
|------------|----------|----------------------------------------------------------------|
| `account`  | `string` | (Required) The account for which to retrieve event logs.       |
| `chainId`  | `int`    | (Required) The chain ID from where event logs must be fetched. |
| `page`     | `int`    | (Optional) The page number used in pagination.                 |
| `pageSize` | `int`    | (Optional) The number of elements contained in each page.      |


