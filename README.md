### The backend-example package is a simple example for retrieve and store data from the blockchain using the media-sdk

## Installation
```bash
git clone https://github.com/mediafoundation/backend-example.git

cp .env.example .env

npm install
```

## Configuration
### .env
```bash
# Replace all fields with your own values in .env file

dbName=DB_NAME
dbUser=DB_USER
dbPassword=DB_PASSWORD
dbHost=DB_HOST
dbPort=3306
dbDialect=DB_DIALECT
```

## Usage
### Retrieve all data from the blockchain and store it into the database
```bash
npm run init
```
This command retrieves all data from the blockchain and stores it into the configured database.

### Execute the api (npm run init must be executed before this command)
```bash
npm run startApi
```
After running this command, you will see a message indicating that the API server has started successfully.

## Using the api
### Deals

#### Get all deals
```bash
curl -X GET http://localhost:5000/deals
```
#### Get deal by id
```bash
curl -X GET http://localhost:5000/deals/1
```
#### Get deals with filtered by metadata, for more information about filters see [api filters documentation](#filters)
```bash
curl-G -i 'http://localhost:5000/deals' --data-urlencode 'filter={"metadataFilter": {"burstSpeed": {"gt": 100}}}'
```
#### Get deals with filtered by nodeLocation and pagination
```bash
curl -G -i 'http://localhost:5000/deals' --data-urlencode 'filter={"nodeLocationFilter": {"location": {"eq": "BR"}}}&page=1&limit=10'
```

# Filters
### Schema and usages
#### There are four filters that can be used with deals and offers:
- metadataFilter
- nodeLocationFilter
- bandwidthFilter
- offer or deal filter
#### They are meant to be used following the filter schema from sequelize, for more information about the filter schema see [sequelize documentation](https://sequelize.org/master/manual/model-querying-basics.html#operators)
#### Also, every field from which the filter is going to be applied must be a field from the deal or offer model, and its associated tables. All they are defined in the models' folder.

#### The following example shows how to order the filters in the query:
```json
{
  "metadataFilter": {
    "burstSpeed": {
      "gt": 100
    }
  },
  "nodeLocationFilter": {
    "location": {
      "eq": "BR"
    }
  },
  "bandwidthFilter": {
    "amount": {
      "gt": 100
    }
  },
  "offerFilter": {
    "maximumDeals": {
      "eq": 2000
    }
  }
}
```
```bash
curl -G -i 'http://localhost:5000/offers?' --data-urlencode 'filters={"metadataFilter": {"burstSpeed": {"gt": 100}}, "nodeLocationFilter": {"location": {"eq": "BR"}}, "bandwidthFilter": {"amount": {"eq": 1}}, "offerFilter": {"maximumDeals": {"gt": 100}}}'
```
#### Take into account that the filters are optional and can be used together or separately.
