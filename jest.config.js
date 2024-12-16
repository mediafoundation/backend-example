/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.ts?$": ["ts-jest",{}],
  },
  maxWorkers: 1,
  silent: true,
}