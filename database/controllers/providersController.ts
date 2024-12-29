import {Provider} from "../models/Providers/Provider"
import {Chain} from "../models/Chain"
import {ChainProvider} from "../models/manyToMany/ChainProvider"
import {ProviderAssociationCount} from "../models/types/provider"
import {ProviderClient} from "../models/manyToMany/ProviderClient"
import {ChainClient} from "../models/manyToMany/ChainClient"
import {eventsCollection, Op, sequelize} from "../database"
import {Deal} from "../models/deals/Deal"
import {ProvidersMetadata} from "../models/Providers/ProvidersMetadata"
import {Rating} from "../models/Rating"

interface ProviderFilters {
  chainId?: number | number[] | undefined
  page?: number | undefined
  pageSize?: number | undefined
  account?: string | undefined
  minRating?: number | undefined
}

export class ProvidersController {
  static async getProviders({
    chainId = undefined,
    page = undefined,
    pageSize = undefined,
    account = undefined,
    minRating = undefined
  }: ProviderFilters) {

    const chainIdFilter = Array.isArray(chainId) ? {
      chainId: { [Op.in]: chainId }
    } : chainId ? {
      chainId: chainId
    } : undefined

    const validChainIdsSubquery = `
      SELECT DISTINCT "Rating"."chainId"
      FROM "Rating"
      WHERE "Rating"."sum" / NULLIF("Rating"."count", 0) >= ${minRating || 0}
    `

    const filter = account ? {account: account} : {}
    const offset = page && pageSize ? (page - 1) * pageSize : undefined

    const limitQuery = offset != undefined ? {
      limit: pageSize,
      offset: offset
    } : {}
    const providers = await Provider.findAll({
      where: filter,
      include: [
        {
          model: Chain,
          where: {
            ...chainIdFilter,
            ...(minRating ? { chainId: { [Op.in]: sequelize.literal(`(${validChainIdsSubquery})`) } } : {})
          },
          through: {
            attributes: []
          },
          attributes: ["chainId"],
          required: !!chainId || !!minRating
        },

        {
          model: Rating,
          where: minRating ? {
            [Op.and]: [
              sequelize.literal(`"Ratings"."sum" / NULLIF("Ratings"."count", 0) >= ${minRating || 0} `),
              chainId ? { chainId: { [Op.in]: Array.isArray(chainId) ? chainId : [chainId] } } : {}
            ]
          } : undefined,
          attributes: ["sum", "count", "chainId"],
          required: !!minRating,
        }
      ],
      ...limitQuery
    })

    const mappedProviders = providers.map((provider) => provider.toJSON())

    for (let i = 0; i < providers.length; i++) {
      mappedProviders[i].Chains = mappedProviders[i].Chains!.map((chain: any) => chain.chainId)
    }

    return mappedProviders
  }

  static async getMetadata(provider: string, chainId: number | number[] | undefined) {
    //return await providersCollection.findOne({provider: provider, chainId: {$in: chainId}})
    const chainIdFilter = Array.isArray(chainId) ? {
      chainId: { [Op.in]: chainId }
    } : chainId ? {
      chainId: chainId
    } : undefined
    return await ProvidersMetadata.findOne({
      where: {
        provider: provider,
        ...chainIdFilter
      },
      raw: true
    })
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

    /*const query = {provider: provider, chainId: chainId}
    const update = {$set: {
      provider: provider,
      chainId: chainId,
      ...JSON.parse(providerMetadata)
    }}
    const options = {upsert: true}

    await providersCollection.updateOne(query, update, options)*/

    await ProvidersMetadata.upsert({provider: provider, chainId: chainId, metadata: providerMetadata})

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

    if (client) {
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

  static async countDeals(provider: string, chainId: number | number[] | undefined = undefined): Promise<ProviderAssociationCount | number> {
    //let result: ProviderAssociationCount | number = {}
    const providerFromDb = await Provider.findOne({rejectOnEmpty: false, where: {account: provider}})

    if (!providerFromDb) {
      throw new Error("Provider not found")
    }

    const chainIdFilter = Array.isArray(chainId) ? {
      chainId: { [Op.in]: chainId }
    } : chainId ? {
      chainId: chainId
    } : undefined

    return  await providerFromDb!.countDeals({
      where: chainIdFilter
    })
  }

  static async countOffers(provider: string, chainId: number | number[] | undefined = undefined): Promise<ProviderAssociationCount | number> {
    const providerFromDb = await Provider.findOne({rejectOnEmpty: false, where: {account: provider}})

    if (!providerFromDb) {
      throw new Error("Provider not found")
    }

    const chainIdFilter = Array.isArray(chainId) ? {
      chainId: { [Op.in]: chainId }
    } : chainId ? {
      chainId: chainId
    } : undefined

    return await providerFromDb!.countOffers({
      where: {
        chainId: chainIdFilter
      }
    })
  }

  static async countClients(provider: string, chainId: number | number[] | undefined = undefined) {
    let result: ProviderAssociationCount | number = {}
    const providerFromDb = await Provider.findOne({rejectOnEmpty: false, where: {account: provider}})

    if (!providerFromDb) {
      throw new Error("Provider not found")
    }

    const chainIdFilter = Array.isArray(chainId) ? {
      chainId: { [Op.in]: chainId }
    } : chainId ? {
      chainId: chainId
    } : undefined

    /*if (chainId === undefined) {
      const chains = await Chain.findAll({attributes: {include: ["chainId"]}})

      for (const chain of chains) {

        const clientsOnChain = await ChainClient.findAll({where: {chainId: chain.chainId}})
        result[chain.chainId] = await providerFromDb!.countClients({where: {account: clientsOnChain.map(chainClient => chainClient.client)}})
      }
    } else {

    }*/

    const clientsOnChain = await ChainClient.findAll({
      where: {
        chainId: chainIdFilter
      }
    })
    result = await providerFromDb!.countClients({where: {account: clientsOnChain.map(chainClient => chainClient.client)}})

    return result
  }

  static async getProviderActiveClients(provider: string, chainId: number[] | undefined = undefined, fromDate: number = 0, toDate: number = Math.floor(Date.now() / 1000)) {
    const providerFromDb = await Provider.findOne({rejectOnEmpty: false, where: {account: provider}})

    if (!providerFromDb) {
      throw new Error("Provider not found")
    }

    const chains = chainId ? chainId : (await Chain.findAll({attributes: {include: ["chainId"]}})).map(chain => chain.chainId)

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
                sequelize.literal("(CAST(\"Deal\".\"blockedBalance\" AS DECIMAL) / CAST(\"Deal\".\"pricePerSecond\" AS DECIMAL)) + CAST(\"Deal\".\"billingStart\" AS DECIMAL)"),
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

        if (clientsDeals.length > 0 && clientsDeals[0].count == 0) {
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

  static async getProviderNewClients(provider: string, chainId: number[], fromDate: number = 0, toDate: number = Math.floor(Date.now() / 1000)) {
    const latestBillings = await Deal.findAll({
      where: {
        provider: provider,
        chainId: {
          [Op.in]: chainId
        }
      },

      attributes: [
        "client",
        [sequelize.fn("MIN", sequelize.col("createdAt")), "createdAt"]
      ],
      group: ["Deal.client"],
      raw: true
    })

    //console.log("Latest billings", latestBillings)

    // Filter the results within the specified period
    const filteredClients = latestBillings.filter(record => {
      return record.createdAt >= fromDate && record.createdAt <= toDate
    })

    return filteredClients.length
  }

  static async getProviderStartTime(provider: string, chainId: number[]): Promise<{ [index: number]: number }> {
    const result: { [index: number]: number } = {}
    for (const chain of chainId) {
      const providerData = await eventsCollection.findOne({
        provider: provider,
        chainId: chain,
        eventName: "ProviderRegistered"
      })
      if (result) {
        result[chain] = providerData?.timestamp || 0
      }
    }

    return result
  }
}