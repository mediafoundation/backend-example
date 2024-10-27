/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  silent: true,
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.json",
    }],
  },
}