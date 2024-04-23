import * as crypto from "crypto"

export function generateUniqueEventId(eventHash: string) {
  const hash = crypto.createHash("sha256")

  hash.update(eventHash)

  const hashHex = hash.digest("hex")

  return hashHex.substring(0, 20)
}