import {Provider} from "../models/Provider"
import {Chain} from "../models/Chain"

export class ProvidersController {
  static async getProviders(chainId: number | undefined = undefined, page: number | undefined= undefined, pageSize: number | undefined= undefined) {
    const offset = page && pageSize ? (page - 1) * pageSize : undefined
    return Provider.findAll({
      include: [
        {
          model: Chain,
          required: !!chainId,
          where: {
            chainId: chainId ? chainId : null
          },
          attributes: [],
          as: "Chain"
        },
      ],
      offset: offset,
      limit: pageSize,
      raw: true
    })
  }
}