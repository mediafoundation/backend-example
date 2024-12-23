import {NextFunction, Request, Response} from "express"

export enum ValidatorType {
  STRING = "string",
  NUMBER = "number",
  STRING_OPTIONAL = "string-optional",
  NUMBER_OPTIONAL = "number-optional",
  NUMBER_ARRAY = "number[]",
  NUMBER_ARRAY_OPTIONAL = "number[]-optional",
  DATE = "date",
  DATE_OPTIONAL = "date-optional",
}

type ValidatorSchema = {
  [key: string]: ValidatorType;
};

const isValidDate = (value: string): boolean => {
  const dateRegex = /^(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})$/
  if (!dateRegex.test(value)) {
    return false
  }

  const parsedDate = new Date(value)
  const parts = value.includes("-")
    ? value.split(/[-/]/).map(Number)
    : value.split(/[-/]/).reverse().map(Number)

  const [year, month, day] = parts.length === 3 && parts[0] > 31 ? parts : [parts[2], parts[1], parts[0]]

  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() + 1 === month &&
    parsedDate.getUTCDate() === day
  )
}

export const validateParams = (schema: ValidatorSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = []

    for (const key in schema) {
      const expectedType = schema[key]
      const value = req.body?.[key] ?? req.query?.[key] ?? req.params?.[key]

      const isOptional = expectedType.endsWith("-optional")
      const cleanExpectedType = expectedType.replace("-optional", "")

      if (isOptional && value === undefined) {
        continue
      }

      if (value === undefined) {
        errors.push(`Parameter "${key}" is required.`)
        continue
      }

      switch (cleanExpectedType) {
      case "string":
        if (typeof value !== "string") {
          errors.push(`Parameter "${key}" must be a string.`)
        }
        break

      case "number":
        if (isNaN(Number(value))) {
          errors.push(`Parameter "${key}" must be a number.`)
        }
        break

      case "number[]":
        if (!Array.isArray(value) || !value.every((item) => !isNaN(Number(item)))) {
          errors.push(`Parameter "${key}" must be an array of numbers.`)
        }
        break

      case "date":
        if (typeof value !== "string" || !isValidDate(value)) {
          errors.push(`Parameter "${key}" must be a valid date in formats YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, or DD/MM/YYYY.`)
        }
        break

      default:
        errors.push(`Unknown validation type for parameter "${key}".`)
        break
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({ errors })
    }

    next()
  }
}
