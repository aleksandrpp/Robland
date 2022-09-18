import { createServer } from 'http'
import { Server } from 'node-static'

const port = process.env.PORT || 8080

const fileServer = new Server('./public/')
createServer(function (req, res) {
    fileServer.serve(req, res)
}).listen(port)

console.log(`static server on ${port}`)
