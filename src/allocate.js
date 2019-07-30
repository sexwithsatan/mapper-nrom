/* globals Object, Uint8ClampedArray */
import deserialize from '@esnes/ines-header'
import readAsArrayBuffer from './read-as-array-buffer.js'

export default
async function allocate(rom) {
  const buffer = await readAsArrayBuffer(rom)
  const header = new Uint8ClampedArray(buffer, 0, 0x10)
  const {size} = deserialize(header)

  const prgrom = new Uint8ClampedArray(buffer, 0x10, size.program)
  const chrrom = new Uint8ClampedArray(buffer, 0x10 + size.program, size.graphics)

  const banks = ({
    program: [
/* CPU $8000 */prgrom.subarray(0, 0x4000),
/* CPU $C000 */prgrom.subarray(size.program - 0x4000, size.program)
    ],

    graphics: [
/* PPU $0000 */chrrom.subarray(0x0000, 0x1000),
/* PPU $1000 */chrrom.subarray(0x1000, 0x2000)
    ]
  })

  console.log(deserialize(header))

  return ({
    program: [
      function read(address) {
        const a14 = (address >>> 14) & 1

        // A14 of the address selects a 16-KiB PRG-ROM bank:
        //  A14=0 selects the lower bank at CPU $8000-BFFF
        //  A14=1 selects the upper bank at CPU $C000-FFFF
        return banks.program[a14][address & 0x3fff]
      },

      function write(address, data) {
        // TODO
      }
    ],

    graphics: [
      function read(address) {
        const a12 = (address >>> 12) & 1
        
        // A12 of the address selects one half of the pattern table:
        //  A12=0 selects the 'left' half at PPU $0000-0FFF
        //  A12=1 selects the 'right' half at PPU $1000-1FFF
        return banks.graphics[a12][address & 0x0fff]
      },

      function write(address, data) {
        // TODO
      }
    ]
  })
}
