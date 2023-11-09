let DealsController = require("./database/controllers/dealsController")
let {initDatabase} = require("./config/config")
module.exports = {
  initDatabase,
  DealsController
}