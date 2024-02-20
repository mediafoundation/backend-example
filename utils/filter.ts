import { Op, Op as SequelizeOp } from "sequelize";

type OpKeyType = keyof typeof SequelizeOp;

export function parseFilter(obj: any = {}) {
    const sequelizeOperators: OpKeyType[] = ['and', 'or', 'gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'like', 'notLike', 'iLike', 'notILike', 'startsWith', 'endsWith', 'substring', 'regexp', 'notRegexp', 'iRegexp', 'notIRegexp', 'contains', 'overlap', 'adjacent', 'strictLeft', 'strictRight', 'noExtendRight', 'noExtendLeft', 'and', 'or', 'any', 'all', 'values', 'col', 'placeholder'];

    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            if (sequelizeOperators.includes(key as OpKeyType)) {
                const operator = Op[key as OpKeyType] || key;
                obj[operator] = obj[key].map(parseFilter);
                delete obj[key];
            } else {
                obj[key] = parseFilter(obj[key]);
            }
        }
    });

    return obj;
}