import deserialize from '@esnes/ines2-header'

export default
async function allocate(rom) {
  const array = await uploadAsArrayBuffer(rom)
  const header = new Uint8ClampedArray(array, 0, 16)
  const {size: {PRG, CHR}} = deserialize(header)
  const program = new Uint8ClampedArray(array, 16, PRG)
  const graphics = new Uint8ClampedArray(array, 16 + PRG, CHR)

  return {
    /* TODO */
    program,
    graphics
  }
}
