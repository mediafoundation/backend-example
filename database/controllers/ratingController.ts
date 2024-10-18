import {DealsController} from "./dealsController"
import {Rating} from "../models/Rating"

export class RatingController {
  static async rateProvider(provider: string, dealId: number, chainId: number, rating: number) {
    const client = await DealsController.getDealClient(dealId, chainId)

    if(client) {
      await Rating.upsert({
        provider: provider,
        client: client,
        chainId: chainId,
        rating: rating
      })
    }
  }
  
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

    chainIds.forEach(chainId => {
      if (!averageRatings[chainId]) {
        averageRatings[chainId] = null
      }
    })

    return averageRatings
  }
}