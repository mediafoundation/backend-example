import {Provider} from "../models/Provider"
import {Chain} from "../models/Chain"
import {ChainProvider} from "../models/manyToMany/ChainProvider"
import {ProviderAssociationCount} from "../models/types/provider"
import {ProviderClient} from "../models/manyToMany/ProviderClient"
import {ChainClient} from "../models/manyToMany/ChainClient"
import {Op, providersCollection, sequelize} from "../database"
import {Deal} from "../models/deals/Deal"

export class ProvidersController {
  static async getProviders(chainId: number | undefined = undefined, page: number | undefined= undefined, pageSize: number | undefined = undefined, account: string | undefined = undefined) {
    const whereClause = chainId ? {chainId: chainId} : {}
    const filter = account ? {account: account} : {}
    const offset = page && pageSize ? (page - 1) * pageSize : undefined

    const limitQuery = offset ? {
      limit: pageSize,
      offset: offset
    } : {}
    const providers = await Provider.findAll({
      where: filter,
      include: [
        {
          model: Chain,
          where: whereClause,
          through: {
            attributes: []
          },
          attributes: ["chainId"]
        },
      ],
      ...limitQuery
    })

    const mappedProviders = providers.map((provider) => provider.toJSON())

    for (let i = 0; i < providers.length; i++) {
      mappedProviders[i].Chains = mappedProviders[i].Chains!.map((chain: any) => chain.chainId)
    }

    return mappedProviders
  }

  static async getMetadata(provider: string, chainId: number) {
    return await providersCollection.findOne({provider: provider, chainId: chainId})
  }

  static async upsertProvider(provider: string, chainId: number, client: string | undefined = undefined, providerMetadata: string, publicKey: string) {
    const [instance, created] = await Provider.findOrCreate({
      where: {
        account: provider,
        publicKey: publicKey
      },
      defaults: {
        account: provider,
        publicKey: publicKey
      }
    })

    const query = {provider: provider, chainId: chainId}
    const update = {$set: {
      provider: provider,
      chainId: chainId,
      ...JSON.parse(providerMetadata)
    }}
    const options = {upsert: true}

    await providersCollection.updateOne(query, update, options)

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

    if(client) {
      await ProviderClient.findOrCreate(
        {
          where: {
            provider: provider,
            client: client
          },
          defaults: {
            provider: provider,
            client: client
          }
        }
      )
    }

    return {
      instance: instance.dataValues,
      created: created
    }
  }

  static async countDeals(provider: string, chainId: number | undefined = undefined) {
    let result: ProviderAssociationCount | number = {}
    const providerFromDb = await Provider.findOne({rejectOnEmpty: false, where: {account: provider}})

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
    const providerFromDb = await Provider.findOne({rejectOnEmpty: false, where: {account: provider}})

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

  static async countClients(provider: string, chainId: number | undefined = undefined) {
    let result: ProviderAssociationCount | number = {}
    const providerFromDb = await Provider.findOne({rejectOnEmpty: false, where: {account: provider}})

    if(!providerFromDb) {
      throw new Error("Provider not found")
    }

    if(chainId === undefined) {
      const chains = await Chain.findAll({attributes: {include: ["chainId"]}})

      for (const chain of chains) {

        const clientsOnChain = await ChainClient.findAll({where: {chainId: chain.chainId}})
        result[chain.chainId] = await providerFromDb!.countClients({where: {account: clientsOnChain.map(chainClient => chainClient.client)}})
      }
    }

    else {
      const clientsOnChain = await ChainClient.findAll({where: {chainId: chainId}})
      result = await providerFromDb!.countClients({where: {account: clientsOnChain.map(chainClient => chainClient.client)}})
    }

    return result
  }

  static async getProviderActiveClients(provider: string, chainId: number | undefined = undefined, fromDate: number = 0, toDate: number = Math.floor(Date.now() / 1000)) {
    const providerFromDb = await Provider.findOne({rejectOnEmpty: false, where: {account: provider}})

    if(!providerFromDb) {
      throw new Error("Provider not found")
    }

    const chains = chainId ? [chainId] : (await Chain.findAll({attributes: {include: ["chainId"]}})).map(chain => chain.chainId)

    const result: ProviderAssociationCount = {}

    for (const chain of chains) {
      const clientsOnChain = await ChainClient.findAll({where: {chainId: chain}})
      const clients = (await providerFromDb!.getClients({where: {account: clientsOnChain.map(chainClient => chainClient.client)}})).map(client => client.account)

      for (const client of clients) {
        const clientsDeals = await Deal.count({
          group: "client",
          where: {
            client: client,
            [Op.and]: [
              sequelize.where(
                sequelize.literal("(CAST(blockedBalance AS DECIMAL) / CAST(pricePerSecond AS DECIMAL)) + CAST(billingStart AS DECIMAL)"),
                {
                  [Op.gte]: fromDate
                }
              )
            ],
            billingStart: {
              [Op.lte]: toDate
            }
          }
        })

        if(clientsDeals[0].count == 0){
          const index = clients.indexOf(client)
          if (index > -1) {
            clients.splice(index, 1)
          }
        }

      }

      result[chain] = clients.length
    }
    return result
  }

  static async getProviderNewClients(provider: string, chainId: number, fromDate: number = 0, toDate: number = Math.floor(Date.now() / 1000)) {
    const latestBillings = await Deal.findAll({
      where: {
        provider: provider,
        chainId: chainId
      },

      attributes: [
        "client",
        [sequelize.fn("MIN", sequelize.col("billingStart")), "billingStart"]
      ],
      group: ["Deal.client"],
      raw: true
    })

    console.log("Latest billings", latestBillings)

    // Filter the results within the specified period
    const filteredClients =  latestBillings.filter(record => {
      return record.billingStart >= fromDate && record.billingStart <= toDate
    })

    return filteredClients.length
  }
}