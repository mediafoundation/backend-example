import {z} from "zod"

export type FormattedResource = {
  resourceId: number,
  owner: string,
  encryptedData: string,
  encryptedSharedKey: string,
}

export const EncryptedResourceData = z.object({
  encryptedData: z.string(),
  iv: z.string(),
  tag: z.string()
})