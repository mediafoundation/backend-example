import {Provider} from "../models/Provider"
import {Chain} from "../models/Chain"
import {WhereOptions} from "sequelize"
import {ChainProvider} from "../models/manyToMany/ChainProvider"

export class ProvidersController {
  static async getProviders(chainFilter: WhereOptions<any> | undefined = undefined, page: number | undefined= undefined, pageSize: number | undefined= undefined) {
    const offset = page && pageSize ? (page - 1) * pageSize : undefined
    return Provider.findAll({
      include: [
        {
          model: Chain,
          where: chainFilter,
          through: {
            attributes: []
          },
          attributes: ["chainId"]
        },
      ],
      offset: offset,
      limit: pageSize,
      nest: true,
      raw: true
    })
  }

  static async upsertProvider(provider: string, chainId: number) {
    const [instance, created] = await Provider.findOrCreate({
      where: {
        account: provider
      },
      defaults: {
        account: provider
      }
    })

    await ChainProvider.findOrCreate({
      where: {
        chainId: chainId,
        provider: provider
      },
      defaults: {
        chainId: chainId,
        provider: provider
      }
    })

    return {
      instance: instance.dataValues,
      created: created
    }
  }
}