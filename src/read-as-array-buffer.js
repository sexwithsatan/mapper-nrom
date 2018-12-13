/* globals Promise, FileReader */

export default
function readAsArrayBuffer(file) {
  const reader = new FileReader()

  return new Promise(resolve => {

    reader.addEventListener('load', () => resolve(reader.result))
    reader.readAsArrayBuffer(file)
  })
}
