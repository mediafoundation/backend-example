import { Request, Response, NextFunction } from "express"

export enum ValidatorType {
  STRING = "string",
  NUMBER = "number",
  STRING_OPTIONAL = "string-optional",
  NUMBER_OPTIONAL = "number-optional",
}
type ValidatorSchema = {
  [key: string]: ValidatorType;
}

const validateParams = (schema: ValidatorSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = []

    for (const key in schema) {
      const expectedType = schema[key]
      const value = req.body?.[key] ?? req.query?.[key] ?? req.params?.[key]

      const isOptional = expectedType.endsWith("-optional")
      const cleanExpectedType = expectedType.replace("-optional", "")

      if (isOptional) {
        if (value !== undefined && cleanExpectedType == "number" && isNaN(Number(value))) {
          errors.push(`Optional parameter "${key}" must be ${expectedType.replace("-optional", "")}.`)
        }
        if(value !== undefined && cleanExpectedType == "string" && typeof value !== "string") {
          errors.push(`Optional parameter "${key}" must be ${expectedType.replace("-optional", "")}.`)
        }
        /*if(value !== undefined && cleanExpectedType == "dateTime" && isNaN(Date.parse(value))) {
          errors.push(`Optional parameter "${key}" must be ${expectedType.replace("-optional", "")}.`)
        }*/
        /*if(value !== undefined && expectedType.replace("-optional", "") == "boolean" && typeof value !== "boolean") {
            errors.push(`Optional parameter "${key}" must be ${expectedType.replace("-optional", "")}.`)
        }*/
      } else {
        if (value === undefined) {
          errors.push(`Parameter "${key}" es required.`)
        }

        if (expectedType == "number" && isNaN(Number(value))) {
          errors.push(`Parameter "${key}" must be ${expectedType}.`)
        }

        if(expectedType == "string" && typeof value !== "string") {
          errors.push(`Parameter "${key}" must be ${expectedType}.`)
        }

        /*if(cleanExpectedType == "dateTime" && isNaN(Date.parse(value))) {
          errors.push(`Optional parameter "${key}" must be ${expectedType.replace("-optional", "")}.`)
        }*/

        /*if(expectedType == "boolean" && typeof value !== "boolean") {
            errors.push(`Parameter "${key}" must be ${expectedType}.`)
        }*/
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({ errors })
    }

    next()
  }
}

export default validateParams
