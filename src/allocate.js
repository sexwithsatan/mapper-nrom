import deserialize from '@esnes/ines2-header'
import uploadAsArrayBuffer from './upload-as-array-buffer.js'

export default
async function allocate(rom) {
  const data = await uploadAsArrayBuffer(rom)
  const header = new Uint8ClampedArray(data, 0, 16)
  const {size} = deserialize(header)

  const prgrom = new Uint8ClampedArray(data, 16, size.program)
  const chrrom = new Uint8ClampedArray(data, 16 + size.program, size.graphics)

  const banks = {
    program: [
      prgrom.subarray(0, 0x4000),
      prgrom.subarray(size.program - 0x4000, size.program)
    ],
    graphics: chrrom.subarray(0, 0x2000)
  }

  console.log(deserialize(header))

  return {
    program: {
      read(al, ah) {
        const a14 = (ah >> 6) & 1

        // A14 of the address selects a 16-KiB PRG-ROM bank
        // A14=0 selects the lower bank $8000-BFFF
        // A14=1 selects the upper bank $C000-FFFF
        return banks.program[a14][al + (ah << 8) & 0x3fff]
      },

      write(al, ah, d) {
        // TODO
      }
    },

    graphics: {
      read(al, ah) {
        return banks.graphics[al + (ah << 8) & 0x1fff]
      },

      write(al, ah, d) {
        // TODO
      }
    }
  }
}
