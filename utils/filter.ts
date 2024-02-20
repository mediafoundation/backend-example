import {Op} from "sequelize";

export function parseFilter(obj: any = {}) {

    if (obj.and) {
        obj[Op.and] = obj.and.map(parseFilter);
        delete obj.and;
    }

    if (obj.or) {
        obj[Op.or] = obj.or.map(parseFilter);
        delete obj.or;
    }

    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            obj[key] = parseFilter(obj[key]);
        } else if (key === 'gt') {
            obj[Op.gt] = obj[key];
            delete obj[key];
        }
    });

    return obj;
}