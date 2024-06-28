# API

### This section will cover every aspect that is needed to use the backend-example's API and its endpoint.

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

| Name       | Type     | Description                                                                                                                                                            |
|------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `chainId`  | `int`    | (Optional) The chain ID from where offers must be fetched. If not provided, it will bring from all networks.                                                           |
| `filters`  | `object` | (Optional) The filter object containing all filters that must be applied to the query. For more information, see the [API filters documentation](./README.md#filters). |
| `page`     | `int`    | (Optional) The page number used in pagination. If not provided, it will bring all elements that matches the filters.                                                   |
| `pageSize` | `int`    | (Optional) The number of elements contained in each page. If not provided, it will bring all elements that matches the filters.                                        |

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


### 5. Retrieves provider's revenue on a blockchain

#### GET /revenue

#### Request Parameters

| Name       | Type     | Description                                                                  |
|------------|----------|------------------------------------------------------------------------------|
| `chainId`  | `int`    | (Required) The chain ID from where revenue will be calculated.               |
| `provider` | `string` | (Required) The provider from which want to get the revenue.                  |
| `from`     | `int`    | (Optional) The start time from where to start counting counting the revenue. |
| `to`       | `int`    | (Optional) The time where count must be stopped.                             |
