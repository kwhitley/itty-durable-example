import { randomItem } from 'supergeneric/collections'

// abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRTUVWXYZ2346789 -- 55 chars in non-ambiguous
export const generateHash = (length = 8, options = {}) => {
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const upper = 'ABCDEFGHJKLMNPQRTUVWXYZ'
  const numeric = '2346789'

  return Array(length)
    .fill(0)
    .map((v, index) => index
      ? randomItem(upper + lower + numeric)
      : randomItem(upper + lower) // start with a letter
    )
    .join('')
}
