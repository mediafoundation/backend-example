import {Provider} from "../models/Provider"
import {Chain} from "../models/Chain"
import {WhereOptions} from "sequelize"
import {ChainProvider} from "../models/manyToMany/ChainProvider"

interface ProviderAssociationCount {
  [key: number]: number
}

export class ProvidersController {
  static async getProviders(chainFilter: WhereOptions<any> | undefined = undefined, page: number | undefined= undefined, pageSize: number | undefined= undefined) {
    const offset = page && pageSize ? (page - 1) * pageSize : undefined
    const providers = await Provider.findAll({
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
    })

    const mappedProviders = providers.map((provider: any) => {
      return provider.toJSON()
    })

    for (let i = 0; i < providers.length; i++) {
      mappedProviders[i].Chains = mappedProviders[i].Chains.map((chain: any) => chain.chainId)
    }

    return mappedProviders
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

  static async countDeals(provider: string, chainId: number | undefined = undefined) {
    let result: ProviderAssociationCount | number = {}
    const providerFromDb = await Provider.findOne({where: {account: provider}})

    if(!providerFromDb) {
      throw new Error("Provider not found")
    }

    if(chainId === undefined) {
      const chains = await Chain.findAll({attributes: {include: ["chainId"]}})

      for (const chain of chains) {
        result[chain.chainId] = await providerFromDb!.countDeals({where: {chainId: chain.chainId}})
      }
    }

    else {
      result = await providerFromDb!.countDeals({where: {chainId: chainId}})
    }

    return result
  }

  static async countOffers(provider: string, chainId: number | undefined = undefined) {
    let result: ProviderAssociationCount | number = {}
    const providerFromDb = await Provider.findOne({where: {account: provider}})

    if(!providerFromDb) {
      throw new Error("Provider not found")
    }

    if(chainId === undefined) {
      const chains = await Chain.findAll({attributes: {include: ["chainId"]}})

      for (const chain of chains) {
        result[chain.chainId] = await providerFromDb!.countOffers({where: {chainId: chain.chainId}})
      }
    }

    else {
      result = await providerFromDb!.countOffers({where: {chainId: chainId}})
    }

    return result
  }
}