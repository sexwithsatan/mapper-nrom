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
/* CPU $8000 */prgrom.subarray(0, 0x4000),
/* CPU $C000 */prgrom.subarray(size.program - 0x4000, size.program)
    ],

    graphics: [
/* PPU $0000 */chrrom.subarray(0x0000, 0x1000),
/* PPU $1000 */chrrom.subarray(0x1000, 0x2000)
    ]
  }

  console.log(deserialize(header))

  return {
    program: {
      read(al, ah) {
        const a14 = (ah >> 6) & 1

        // A14 of the address selects a 16-KiB PRG-ROM bank:
        //  A14=0 selects the lower bank $8000-$BFFF
        //  A14=1 selects the upper bank $C000-$FFFF
        return banks.program[a14][al + (ah << 8) & 0x3fff]
      },

      write(al, ah, d) {
        // TODO
      }
    },

    graphics: {
      read(al, ah) {
        const a12 = (ah >> 4) & 1
        
        // A12 of the address selects one half of the pattern table:
        //  A12=0 selects the left half $0000-$0FFF
        //  A12=1 selects the right half $1000-$1FFF
        return banks.graphics[a12][al + (ah << 8) & 0x0fff]
      },

      write(al, ah, d) {
        // TODO
      }
    }
  }
}
