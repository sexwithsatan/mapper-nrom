import deserialize from '@esnes/ines2-header'
import uploadAsArrayBuffer from './upload-as-array-buffer.js'

function* prgrom(rom) {
  while (true) {
    yield [
      rom.subarray(0, 0x4000),
      rom.subarray(rom.length - 0x4000, rom.length)
    ]
  }
}

function* chrrom(rom) {
  while (true) {
    yield [
      rom.subarray(0, 0x2000)
    ]
  }
}

function* program(rom) {
  for (const swap of prgrom(rom)) {
    yield (al, ah) => {
      const a14 = (ah >> 6) & 0x01

      // A14=0 is the lower bank $8000-BFFF
      // A14=1 is the upper bank $C000-FFFF
      return swap[a14][al + (ah << 8) & 0x3fff]
    }
  }
}

function* graphics(rom) {
  for (const swap of chrrom(rom)) {
    yield (al, ah) => swap[0][al + (ah << 8) & 0x1fff]
  }
}

function bus({value}, write) {
  return {read: value, write}
}

export default
async function allocate(rom) {
  const rom = await uploadAsArrayBuffer(rom)
  const header = new Uint8ClampedArray(rom, 0, 16)
  const {size} = deserialize(header)
  const prgrom = new Uint8ClampedArray(rom, 16, size.program)
  const chrrom = new Uint8ClampedArray(rom, 16 + size.program, size.graphics)
  const mapper = {
    prgrom: program(prgrom),
    chrrom: graphics(chrrom)
  }

  console.log(deserialize(header))

  return { // fixme wtf
    program: {value: read} = mapper.prgrom.next(d),
    graphics: {value: read} = mapper.chrrom.next(d)
  }
}
