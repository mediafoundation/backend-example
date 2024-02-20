import {Op} from "sequelize";
import {parseFilter} from "../../utils/filter";

describe('parseFilter function', () => {
    it('should parse a simple filter with "gt" and "is" operators', () => {
        const filter = {authorId: 2}

        const expectedResult = {
            authorId: 2
        }

        let result = parseFilter(filter);

        expect(result).toEqual(expectedResult);
    });

    it("filter with operators", () => {
        const filter = {
            and: [
                {authorId: 2},
                {
                    or: [
                        {title: 'title1'},
                        {title: 'title2'}
                    ]
                }
            ]
        }

        let stringFilter = JSON.stringify(filter);
        let filterAgain = JSON.parse(stringFilter);

        console.log("FilterAgain", filterAgain)

        const expectedResult = {
            [Op.and]: [
                {authorId: 2},
                {
                    [Op.or]: [
                        {title: 'title1'},
                        {title: 'title2'}
                    ]
                }
            ]
        }

        let result = parseFilter(filter);

        expect(result).toEqual(expectedResult);
    })
});
