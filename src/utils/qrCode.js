const VERSION = 5
const SIZE = 17 + VERSION * 4
const DATA_CODEWORDS = 108
const EC_CODEWORDS = 26
const FORMAT_MASK = 0x5412
const FORMAT_GENERATOR = 0x537
const ALIGNMENT_POSITIONS = [6, 30]

const encoder = new TextEncoder()

const getBit = (value, index) => ((value >>> index) & 1) !== 0

const appendBits = (bits, value, length) => {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1)
  }
}

const createGaloisTables = () => {
  const exp = new Array(512).fill(0)
  const log = new Array(256).fill(0)
  let x = 1

  for (let i = 0; i < 255; i += 1) {
    exp[i] = x
    log[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }

  for (let i = 255; i < 512; i += 1) {
    exp[i] = exp[i - 255]
  }

  return { exp, log }
}

const { exp: gfExp, log: gfLog } = createGaloisTables()

const gfMultiply = (x, y) => {
  if (x === 0 || y === 0) return 0
  return gfExp[gfLog[x] + gfLog[y]]
}

const createGenerator = (degree) => {
  const result = new Array(degree).fill(0)
  result[degree - 1] = 1
  let root = 1

  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < result.length; j += 1) {
      result[j] = gfMultiply(result[j], root)
      if (j + 1 < result.length) result[j] ^= result[j + 1]
    }
    root = gfMultiply(root, 0x02)
  }

  return result
}

const createErrorCorrection = (dataCodewords) => {
  const generator = createGenerator(EC_CODEWORDS)
  const remainder = new Array(EC_CODEWORDS).fill(0)

  dataCodewords.forEach((codeword) => {
    const factor = codeword ^ remainder.shift()
    remainder.push(0)

    generator.forEach((coefficient, index) => {
      remainder[index] ^= gfMultiply(coefficient, factor)
    })
  })

  return remainder
}

const createDataCodewords = (payload) => {
  const bytes = encoder.encode(payload)
  if (bytes.length > 106) {
    throw new Error('QR payload is too long for the ticket QR code')
  }

  const bits = []
  appendBits(bits, 0b0100, 4)
  appendBits(bits, bytes.length, 8)
  bytes.forEach((byte) => appendBits(bits, byte, 8))
  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length))

  while (bits.length % 8 !== 0) bits.push(0)

  const codewords = []
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0
    for (let j = 0; j < 8; j += 1) value = (value << 1) | bits[i + j]
    codewords.push(value)
  }

  for (let pad = 0xec; codewords.length < DATA_CODEWORDS; pad ^= 0xec ^ 0x11) {
    codewords.push(pad)
  }

  return codewords
}

const createMatrix = () => ({
  modules: Array.from({ length: SIZE }, () => new Array(SIZE).fill(false)),
  reserved: Array.from({ length: SIZE }, () => new Array(SIZE).fill(false))
})

const setModule = (matrix, x, y, dark, reserved = true) => {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
  matrix.modules[y][x] = dark
  if (reserved) matrix.reserved[y][x] = true
}

const drawFinderPattern = (matrix, x, y) => {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const xx = x + dx
      const yy = y + dy
      const isInside = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6
      const isDark = isInside && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4))
      setModule(matrix, xx, yy, isDark)
    }
  }
}

const drawAlignmentPattern = (matrix, centerX, centerY) => {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy))
      setModule(matrix, centerX + dx, centerY + dy, distance !== 1)
    }
  }
}

const drawFunctionPatterns = (matrix) => {
  drawFinderPattern(matrix, 0, 0)
  drawFinderPattern(matrix, SIZE - 7, 0)
  drawFinderPattern(matrix, 0, SIZE - 7)

  for (let i = 8; i < SIZE - 8; i += 1) {
    setModule(matrix, i, 6, i % 2 === 0)
    setModule(matrix, 6, i, i % 2 === 0)
  }

  ALIGNMENT_POSITIONS.forEach((x) => {
    ALIGNMENT_POSITIONS.forEach((y) => {
      const overlapsFinder = (x === 6 && y === 6) || (x === 6 && y === SIZE - 7) || (x === SIZE - 7 && y === 6)
      if (!overlapsFinder) drawAlignmentPattern(matrix, x, y)
    })
  })

  for (let i = 0; i < 8; i += 1) {
    setModule(matrix, 8, i, false)
    setModule(matrix, i, 8, false)
    setModule(matrix, SIZE - 1 - i, 8, false)
    setModule(matrix, 8, SIZE - 1 - i, false)
  }

  setModule(matrix, 8, 8, false)
  setModule(matrix, 8, SIZE - 8, true)
}

const maskBit = (mask, x, y) => {
  switch (mask) {
    case 0: return (x + y) % 2 === 0
    case 1: return y % 2 === 0
    case 2: return x % 3 === 0
    case 3: return (x + y) % 3 === 0
    case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
    case 7: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
    default: return false
  }
}

const drawCodewords = (matrix, codewords, mask) => {
  const bits = codewords.flatMap((codeword) => {
    const codewordBits = []
    appendBits(codewordBits, codeword, 8)
    return codewordBits
  })
  let bitIndex = 0
  let upward = true

  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1

    for (let vertical = 0; vertical < SIZE; vertical += 1) {
      const y = upward ? SIZE - 1 - vertical : vertical

      for (let dx = 0; dx < 2; dx += 1) {
        const x = right - dx
        if (matrix.reserved[y][x]) continue

        const bit = bitIndex < bits.length ? bits[bitIndex] === 1 : false
        setModule(matrix, x, y, bit !== maskBit(mask, x, y), false)
        bitIndex += 1
      }
    }

    upward = !upward
  }
}

const createFormatBits = (mask) => {
  const errorCorrectionLevel = 1
  const data = (errorCorrectionLevel << 3) | mask
  let remainder = data << 10

  for (let i = 14; i >= 10; i -= 1) {
    if (((remainder >>> i) & 1) !== 0) {
      remainder ^= FORMAT_GENERATOR << (i - 10)
    }
  }

  return ((data << 10) | remainder) ^ FORMAT_MASK
}

const drawFormatBits = (matrix, mask) => {
  const bits = createFormatBits(mask)

  for (let i = 0; i <= 5; i += 1) setModule(matrix, 8, i, getBit(bits, i))
  setModule(matrix, 8, 7, getBit(bits, 6))
  setModule(matrix, 8, 8, getBit(bits, 7))
  setModule(matrix, 7, 8, getBit(bits, 8))
  for (let i = 9; i < 15; i += 1) setModule(matrix, 14 - i, 8, getBit(bits, i))

  for (let i = 0; i < 8; i += 1) setModule(matrix, SIZE - 1 - i, 8, getBit(bits, i))
  for (let i = 8; i < 15; i += 1) setModule(matrix, 8, SIZE - 15 + i, getBit(bits, i))
  setModule(matrix, 8, SIZE - 8, true)
}

const scoreMatrix = (modules) => {
  let score = 0

  for (let y = 0; y < SIZE; y += 1) {
    let runColor = modules[y][0]
    let runLength = 1
    for (let x = 1; x < SIZE; x += 1) {
      if (modules[y][x] === runColor) {
        runLength += 1
        if (runLength === 5) score += 3
        else if (runLength > 5) score += 1
      } else {
        runColor = modules[y][x]
        runLength = 1
      }
    }
  }

  for (let x = 0; x < SIZE; x += 1) {
    let runColor = modules[0][x]
    let runLength = 1
    for (let y = 1; y < SIZE; y += 1) {
      if (modules[y][x] === runColor) {
        runLength += 1
        if (runLength === 5) score += 3
        else if (runLength > 5) score += 1
      } else {
        runColor = modules[y][x]
        runLength = 1
      }
    }
  }

  for (let y = 0; y < SIZE - 1; y += 1) {
    for (let x = 0; x < SIZE - 1; x += 1) {
      const dark = modules[y][x]
      if (dark === modules[y][x + 1] && dark === modules[y + 1][x] && dark === modules[y + 1][x + 1]) score += 3
    }
  }

  const darkCount = modules.flat().filter(Boolean).length
  const darkPercent = (darkCount * 100) / (SIZE * SIZE)
  score += Math.floor(Math.abs(darkPercent - 50) / 5) * 10

  return score
}

export const createQrMatrix = (payload) => {
  const dataCodewords = createDataCodewords(payload)
  const codewords = [...dataCodewords, ...createErrorCorrection(dataCodewords)]
  let bestMatrix = null
  let bestScore = Infinity

  for (let mask = 0; mask < 8; mask += 1) {
    const matrix = createMatrix()
    drawFunctionPatterns(matrix)
    drawCodewords(matrix, codewords, mask)
    drawFormatBits(matrix, mask)

    const score = scoreMatrix(matrix.modules)
    if (score < bestScore) {
      bestScore = score
      bestMatrix = matrix.modules
    }
  }

  return bestMatrix
}

export const createTicketQrPayload = (ticket) => {
  const id = encodeURIComponent(ticket.id || '')
  const venue = encodeURIComponent(ticket.venueId || ticket.venueCode || 'venue')
  const date = encodeURIComponent(ticket.date || '')
  const slot = encodeURIComponent(ticket.slot || '')
  const count = encodeURIComponent(ticket.count || 1)

  return `BJCT:${id};V=${venue};D=${date};S=${slot};N=${count}`
}
