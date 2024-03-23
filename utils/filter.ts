import { Op, Op as SequelizeOp } from "sequelize"

type OpKeyType = keyof typeof SequelizeOp;

/**
 * Parses a filter object and replaces string keys that match Sequelize operators with the actual Sequelize operator symbols.
 * @param obj - The filter object to be parsed. Default is an empty object.
 * @returns The parsed filter object with Sequelize operator symbols.
 */
export function parseFilter(obj: any = {}) {
  // Define the list of Sequelize operators
  const sequelizeOperators: OpKeyType[] = ["and", "or", "gt", "gte", "lt", "lte", "eq", "ne", "like", "notLike", "iLike", "notILike", "startsWith", "endsWith", "substring", "regexp", "notRegexp", "iRegexp", "notIRegexp", "contains", "overlap", "adjacent", "strictLeft", "strictRight", "noExtendRight", "noExtendLeft", "and", "or", "any", "all", "values", "col", "placeholder"]
  
  // Iterate over the keys of the object
  Object.keys(obj).forEach(key => {
    // If the value of the key is an object
    if (typeof obj[key] === "object") {
      // If the key is a Sequelize operator
      if (sequelizeOperators.includes(key as OpKeyType)) {
        // Get the Sequelize operator symbol
        const operator = Op[key as OpKeyType] || key
        // Replace the key with the Sequelize operator symbol and parse the value
        obj[operator] = obj[key].map(parseFilter)
        // Delete the original key
        delete obj[key]
      } else {
        // If the key is not a Sequelize operator, parse the value
        obj[key] = parseFilter(obj[key])
      }
    }
    else{
      // If the value of the key is not an object and the key is a Sequelize operator
      if(sequelizeOperators.includes(key as OpKeyType)){
        // Replace the key with the Sequelize operator symbol
        obj[Op[key as OpKeyType]] = obj[key]
        // Delete the original key
        delete obj[key]
      }
    }
  })
  
  // Return the parsed object
  return obj
}