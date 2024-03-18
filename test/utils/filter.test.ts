import {Op} from "sequelize"
import {parseFilter} from "../../utils/filter"

describe("parseFilter", () => {
  it("should without operators", () => {
    const filter = {authorId: 2}

    const expectedResult = {
      authorId: 2
    }

    const result = parseFilter(filter)

    expect(result).toEqual(expectedResult)
  })

  it("filter with operators", () => {
    const filter = {
      and: [
        {authorId: 2},
        {
          or: [
            {title: "title1"},
            {title2: "title2"}
          ]
        }
      ]
    }

    const expectedResult = {
      [Op.and]: [
        {authorId: 2},
        {
          [Op.or]: [
            {title: "title1"},
            {title2: "title2"}
          ]
        }
      ]
    }

    const result = parseFilter(filter)

    expect(result).toEqual(expectedResult)
  })

  it("contains operator", () => {
    const filter = {
      title: {
        contains: ["title", "second title"]
      }
    }

    const expectedResult = {
      title: {
        [Op.contains]: ["title", "second title"]
      }
    }

    const result = parseFilter(filter)

    expect(result).toEqual(expectedResult)
  })

  it("gt operator", () => {
    const filter = {
      price: {
        gt: 10
      }
    }

    const expectedResult = {
      price: {
        [Op.gt]: 10
      }
    }

    const result = parseFilter(filter)

    expect(result).toEqual(expectedResult)
  })
})
