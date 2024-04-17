import {Provider} from "../models/Provider"

export class ProvidersController {
  static async getProviders(page: number | undefined= undefined, pageSize: number | undefined= undefined) {
    const offset = page && pageSize ? (page - 1) * pageSize : undefined
    return Provider.findAll({
      offset: offset,
      limit: pageSize,
      raw: true
    })
  }
}