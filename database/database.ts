import {Dialect, Op, Sequelize} from "sequelize"
import {MongoClient} from "mongodb"
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config()

let sequelize: Sequelize

const DECIMALS_DIGITS = 50

const uri = process.env.NODE_ENV === "test" ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI
const dbName = process.env.NODE_ENV === "test" ? process.env.TEST_MONGODB_NAME : process.env.MONGODB_NAME

if(process.env.NODE_ENV === "test") {
  sequelize = new Sequelize("sqlite::memory", {logging: false})
}

else{
  sequelize = new Sequelize(process.env.dbName!, process.env.dbUser!, process.env.dbPassword, {
    host: process.env.dbHost,
    dialect: process.env.dbDialect as Dialect,
    port: parseInt(process.env.dbPort!),
    logging: false
  })
}

const client = new MongoClient(uri!)

async function connectToMongodb() {
  return await client.connect()
}

const eventsCollection = client.db(dbName).collection("events")
const lastReadBlockCollection = client.db(dbName).collection("lastReadBlockCollection")


export {sequelize, Op, DECIMALS_DIGITS, connectToMongodb, eventsCollection, lastReadBlockCollection}
