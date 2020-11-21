require("dotenv").config()
const bodyParser = require('body-parser')
const http = require("http")
const WebSocket = require('ws')
var express = require("express")
var app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(bodyParser.raw())
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

var connections = []
var messageHistory = []
wss.on('connection', async ws => {
	connections.push(ws)

	// Send the last 10 messages right away
	ws.send(messageHistory.slice(-10).join("\n"))

	ws.on('message', async msg => {
		// Recieved a message; echo it back to everyone
		connections.forEach(socket => socket.send(msg))
		messageHistory.push(msg)
	})

	ws.on('error', err => {
		connections.splice(connections.indexOf(ws), 1)
		console.warn(`Client disconnected - reason: ${err}`)
	})

	ws.on('close', code => {
		connections.splice(connections.indexOf(ws), 1)
		console.warn(`Client closed connection with code ${code}`)
	})
});

//start our server
server.listen(process.env.PORT || 8080, () => {
	console.log(`Server started on port ${server.address().port} :)`)
});

var users = {}
app.post("/login", async function(req, res) {
	res.end(req.body.name)
})
app.post("/signup", async function(req, res) {
	res.end(req.body.name)
})