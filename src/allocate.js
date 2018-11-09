import deserialize from '@esnes/ines2-header'
import uploadAsArrayBuffer from './upload-as-array-buffer.js'

export default
async function allocate(rom) {
  const data = await uploadAsArrayBuffer(rom)
  const header = new Uint8ClampedArray(data, 0, 16)
  const {size: {PRG, CHR}} = deserialize(header)
  const prgrom = new Uint8ClampedArray(data, 16, PRG)
  const chrrom = new Uint8ClampedArray(data, 16 + PRG, CHR)

  return {
    program: {
      read(AL, AH) {
        return prgrom[(AL + (AH << 8)) & 0x3fff]
      },
      write(AL, AH, D) {
        // TODO
      }
    },

    graphics: {
      read(AD, A) {
        return chrrom((AD + (A << 8)) & 0x1fff]
      },
      write(AD, A, D) {
        // TODO
      }
    }
  }
}
