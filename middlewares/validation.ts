import { NextFunction, Request, Response } from "express"

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
  [key: string]: ValidatorType | ValidatorType[];
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

  const [year, month, day] =
    parts.length === 3 && parts[0] > 31 ? parts : [parts[2], parts[1], parts[0]]

  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() + 1 === month &&
    parsedDate.getUTCDate() === day
  )
}

const validateType = (value: any, type: string): boolean => {
  switch (type) {
  case "string":
    return typeof value === "string"
  case "number":
    return !isNaN(Number(value))
  case "number[]":
    return Array.isArray(value) && value.every((item) => !isNaN(Number(item)))
  case "date":
    return typeof value === "string" && isValidDate(value)
  default:
    return false
  }
}

export const validateParams = (schema: ValidatorSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = []

    for (const key in schema) {
      const expectedTypes = Array.isArray(schema[key])
        ? (schema[key] as ValidatorType[])
        : [schema[key] as ValidatorType]
      const value = req.body?.[key] ?? req.query?.[key] ?? req.params?.[key]

      const isOptional = expectedTypes.some((type) => type.endsWith("-optional"))
      const cleanExpectedTypes = expectedTypes.map((type) =>
        type.replace("-optional", "")
      )

      if (isOptional && value === undefined) {
        continue
      }

      if (value === undefined) {
        errors.push(`Parameter "${key}" is required.`)
        continue
      }

      const isValid = cleanExpectedTypes.some((type) => validateType(value, type))
      if (!isValid) {
        errors.push(
          `Parameter "${key}" must match one of the types: ${cleanExpectedTypes.join(
            ", "
          )}.`
        )
      }
    }

    if (errors.length > 0) {
      return res.status(400).send({ errors })
    }

    next()
  }
}
