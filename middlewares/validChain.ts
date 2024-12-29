import {Request, Response, NextFunction} from "express"

export const validateChain = (validChains: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = []
    const chainId = req.body?.["chainId"] ?? req.query?.["chainId"] ?? req.params?.["chainId"]
    const isNumber = !isNaN(Number(chainId))
    const formattedChainId: number[] = isNumber ? [Number(chainId)] : JSON.parse(chainId as string)
    const isValid = formattedChainId.every((id) => {
      if(!validChains.includes(id)) {
        errors.push(`Chain ID "${id}" is not valid.`)
        return false
      }
      else {
        return true
      }
    })

    if(!isValid) {
      return res.status(400).json({errors})
    }

    next()
  }
}