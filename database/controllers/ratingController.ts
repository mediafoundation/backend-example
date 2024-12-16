import {Rating} from "../models/Rating"

export class RatingController {
  static async rateProvider(provider: string, chainId: number, sum: number, count: number) {
    await Rating.upsert({
      provider: provider,
      chainId: chainId,
      sum: sum,
      count: count
    })
  }
  
  /**
 * Retrieves the average rating for a provider across multiple chain IDs.
 * 
 * @param {string} provider - The provider for which to get the average rating.
 * @param {number[]} chainIds - An array of chain IDs to consider for the average rating.
 * @returns {Promise<{ [chainId: number]: number | null }>} - A promise that resolves to an object mapping each chain ID to its average rating or null if no ratings are found.
 */
  static async getAverageRating(provider: string, chainIds: number[]): Promise</*{ [chainId: number]: number | null }*/any> {
    const ratings = await Rating.findAll({
      where: {
        provider: provider,
        chainId: chainIds
      },
      raw: true
    })

    if (ratings.length === 0) {
      return Object.fromEntries(chainIds.map(chainId => [chainId, null]))
    }

    const averageRatings: {[k: string] : number | null} = {}

    ratings.filter(ratings => ratings.chainId).forEach(rating => {
      averageRatings[rating.chainId] = rating.sum / rating.count
    })

    const chainIdsSet = new Set(chainIds.map(String))

    chainIdsSet.forEach(chainId => {
      if (!averageRatings[chainId]) {
        averageRatings[chainId] = null
      }
    })

    return averageRatings
  }
}