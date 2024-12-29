import express from "express"
import request from "supertest"
import {validateParams, ValidatorType} from "../../middlewares/validation"

const testApi = express()

testApi.get("/test", validateParams({
  name: ValidatorType.STRING,
  age: ValidatorType.NUMBER,
  surname: ValidatorType.STRING_OPTIONAL,
  validationDays: ValidatorType.NUMBER_OPTIONAL
}), (req, res) => {
  const {name, age, surname} = req.query
  res.status(200).send(`Hello ${name}, you are ${age} years old and your surname is ${surname}`)
})

testApi.get("/test2", validateParams({
  chains: ValidatorType.NUMBER_ARRAY_OPTIONAL,
  providers: ValidatorType.STRING,
  from: ValidatorType.DATE,
  to: ValidatorType.STRING
}), (req, res) => {
  const {chains, providers, from, to} = req.query
  res.status(200).send(`Chains: ${chains}, Providers: ${providers}, From: ${from}, To: ${to}`)
})

testApi.get("/test3", validateParams({
  numbers: ValidatorType.NUMBER_ARRAY,
  optionalDate: ValidatorType.DATE_OPTIONAL,
}), (req, res) => {
  const {numbers, optionalDate} = req.query
  res.status(200).send(`Numbers: ${numbers}, Optional Date: ${optionalDate}`)
})

describe("Validation middleware", () => {
  describe("Test 1", () => {
    it("should return 400 if a required parameter is missing", async () => {
      const response = await request(testApi).get("/test")
      expect(response.status).toBe(400)
    })

    it("should return 200 if all required parameters are present", async () => {
      const response = await request(testApi).get("/test").query({name: "John", age: 25})
      expect(response.status).toBe(200)
    })

    it("should return 200 if all required parameters are present and optional parameter is missing", async () => {
      const response = await request(testApi).get("/test?name=John&age=25")
      expect(response.status).toBe(200)
    })

    it("should return 200 if all required parameters are present and optional parameter is present", async () => {
      const response = await request(testApi).get("/test?name=John&age=25&surname=Doe")
      expect(response.status).toBe(200)
    })

    it("should return 400 if a required parameter is not a number", async () => {
      const response = await request(testApi).get("/test?name=John&age=twenty")
      expect(response.status).toBe(400)
    })
  })

  describe("Test 2", () => {
    it("should return 400 if a required string parameter is missing", async () => {
      const response = await request(testApi).get("/test2").query({chains: [1, 2], from: "2023-01-01", to: "2023-12-31"})
      expect(response.status).toBe(400)
    })

    it("should return 200 if all required parameters are present", async () => {
      const response = await request(testApi).get("/test2").query({chains: [1, 2], providers: "provider1", from: "2023-01-01", to: "2023-12-31"})
      expect(response.status).toBe(200)
    })

    it("should return 400 if a required date parameter is missing", async () => {
      const response = await request(testApi).get("/test2").query({chains: [1, 2], providers: "provider1", to: "2023-12-31"})
      expect(response.status).toBe(400)
    })

    it("should return 400 if a required date parameter is invalid", async () => {
      const response = await request(testApi).get("/test2").query({chains: [1, 2], providers: "provider1", from: "invalid-date", to: "2023-12-31"})
      expect(response.status).toBe(400)
    })

    it("should return 200 if all required parameters are present and optional parameters are missing", async () => {
      const response = await request(testApi).get("/test2").query({providers: "provider1", from: "2023-01-01", to: "2023-12-31"})
      expect(response.status).toBe(200)
    })

    it("should return 400 if a required number array parameter is invalid", async () => {
      const response = await request(testApi).get("/test2").query({chains: "invalid-array", providers: "provider1", from: "2023-01-01", to: "2023-12-31"})
      expect(response.status).toBe(400)
    })

    it("should return 200 if all required parameters are present and optional number array parameter is valid", async () => {
      const response = await request(testApi).get("/test2").query({chains: [1, 2], providers: "provider1", from: "2023-01-01", to: "2023-12-31"})
      expect(response.status).toBe(200)
    })

    it("should return 400 if a required date array parameter is invalid", async () => {
      const response = await request(testApi).get("/test2").query({chains: [1, 2], providers: "provider1", from: ["invalid-date"], to: "2023-12-31"})
      expect(response.status).toBe(400)
    })

    it("should return 200 if all required parameters are present and optional date array parameter is valid", async () => {
      const response = await request(testApi).get("/test2").query({chains: [1, 2], providers: "provider1", from: ["2023-01-01"], to: "2023-12-31"})
      expect(response.status).toBe(200)
    })
  })

  describe("Test 3", () => {
    it("should return 400 if a required number array parameter is missing", async () => {
      const response = await request(testApi).get("/test3").query({optionalDate: "2023-01-01", })
      expect(response.status).toBe(400)
    })

    it("should return 200 if all required parameters are present", async () => {
      const response = await request(testApi).get("/test3").query({numbers: [1, 2], optionalDate: "2023-01-01", })
      expect(response.status).toBe(200)
    })

    it("should return 200 if all required parameters are present and optional parameters are missing", async () => {
      const response = await request(testApi).get("/test3").query({numbers: [1, 2], dates: ["2023-01-01"]})
      expect(response.status).toBe(200)
    })

    it("should return 400 if a required number array parameter is invalid", async () => {
      const response = await request(testApi).get("/test3").query({numbers: "invalid-array", optionalDate: "2023-01-01"})
      expect(response.status).toBe(400)
    })

    it("should return 200 if all required parameters are present and optional date parameter is valid", async () => {
      const response = await request(testApi).get("/test3").query({numbers: [1, 2], optionalDate: "2023-01-01", dates: ["2023-01-01"]})
      expect(response.status).toBe(200)
    })

    it("should return 200 if all required parameters are present and optional date array parameter is valid", async () => {
      const response = await request(testApi).get("/test3").query({numbers: [1, 2]})
      expect(response.status).toBe(200)
    })
  })
})