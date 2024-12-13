import {Rating} from "../models/Rating"

export class RatingController {
  static async rateProvider(provider: string, dealId: number, chainId: number, rating: number) {
    await Rating.upsert({
      provider: provider,
      chainId: chainId,
      rating: rating
    })
  }
  
  /**
 * Retrieves the average rating for a provider across multiple chain IDs.
 * 
 * @param {string} provider - The provider for which to get the average rating.
 * @param {number[]} chainIds - An array of chain IDs to consider for the average rating.
 * @returns {Promise<{ [chainId: number]: number | null }>} - A promise that resolves to an object mapping each chain ID to its average rating or null if no ratings are found.
 */
  static async getAverageRating(provider: string, chainIds: number[]): Promise<{ [chainId: number]: number | null }> {
    const ratings = await Rating.findAll({
      where: {
        provider: provider,
        chainId: chainIds
      }
    })

    if (ratings.length === 0) {
      return Object.fromEntries(chainIds.map(chainId => [chainId, null]))
    }

    const ratingMap = ratings.reduce((acc, rating) => {
      if (!acc[rating.chainId]) {
        acc[rating.chainId] = []
      }
      acc[rating.chainId].push(rating.rating)
      return acc
    }, {} as { [chainId: number]: number[] })

    const averageRatings: {[k: string] : number | null} = Object.fromEntries(
      Object.entries(ratingMap).map(([chainId, chainRatings]) => {
        const totalRating = chainRatings.reduce((sum, rating) => sum + rating, 0)
        return [Number(chainId), totalRating / chainRatings.length]
      })
    )

    const chainIdSet = new Set(chainIds)
    chainIdSet.forEach(chainId => {
      if (!averageRatings[chainId]) {
        averageRatings[chainId] = null
      }
    })

    return averageRatings
  }
}