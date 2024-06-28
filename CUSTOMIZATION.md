### Customization Guide
This section provides a detailed guide on how to customize this example to suit various needs.

### Overview
This example demonstrates the process of retrieving data from the blockchain, storing it in a database, and providing an API for data retrieval. The data is stored in both PostgreSQL and MongoDB, and the API is built using Express.js. All data is modeled to support the functionality of a CDN.

### Models
All models marked as Metadata or dependent on them can be fully customized to fit your needs. You can add new fields, remove existing ones, or change the data types of the fields. The following models are customizable:

- `DealsMetadata`
- `OffersMetadata`
- `BandwidthLimit`
- `NodeLocation`  

Other models can also be customized, but keep in mind that they replicate information from the blockchain. Therefore, it is not recommended to change fields that already exist on the blockchain.

### Controllers
All controllers can be customized. In this example, controllers handle operations to store and retrieve data. You can add new functionalities, modify existing ones, or delete them according to your requirements.

### API
All endpoints are fully customizable to meet your specific needs.