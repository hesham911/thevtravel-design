import { writeFile } from 'node:fs/promises'

const [, , outputPath, widthArg, heightArg, theme = 'light'] = process.argv
const width = Number(widthArg)
const height = Number(heightArg)
const target = await fetch(`http://127.0.0.1:9223/json/new?${encodeURIComponent('http://127.0.0.1:5174/how-booking-works')}`, { method: 'PUT' }).then((response) => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let id = 0
const pending = new Map()
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (!message.id || !pending.has(message.id)) return
  const { resolve, reject } = pending.get(message.id)
  pending.delete(message.id)
  if (message.error) reject(new Error(message.error.message))
  else resolve(message.result)
})

function send(method, params = {}) {
  const commandId = ++id
  socket.send(JSON.stringify({ id: commandId, method, params }))
  return new Promise((resolve, reject) => pending.set(commandId, { resolve, reject }))
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 700,
  screenWidth: width,
  screenHeight: height,
})
await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-color-scheme', value: theme }],
})
await send('Page.navigate', { url: 'http://127.0.0.1:5174/how-booking-works' })
await new Promise((resolve) => setTimeout(resolve, 1500))
await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })
const capture = await send('Page.captureScreenshot', {
  format: 'png',
  fromSurface: true,
  captureBeyondViewport: true,
})
await writeFile(outputPath, Buffer.from(capture.data, 'base64'))
socket.close()
