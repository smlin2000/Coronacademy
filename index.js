require("dotenv").config()
const bodyParser = require('body-parser')
const http = require("http")
const WebSocket = require('ws')
var express = require("express")
var app = express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })


wss.on('connection', async ws => {
	ws.isAlive = true
	ws.on('pong', () => {
		ws.isAlive = true
	})

	ws.on('message', async msg => {

	})

	ws.on('error', (err) => {
		console.warn(`Client disconnected - reason: ${err}`);
	})
});

setInterval(() => {
	wss.clients.forEach(ws => {
		if (!ws.isAlive) {
			console.log("Connection terminated.")
			return ws.terminate()
		}

		ws.isAlive = false;
		ws.ping(null, undefined);
	});
}, 10000);

//start our server
server.listen(process.env.PORT || 8080, () => {
	console.log(`Server started on port ${server.address().port} :)`);
});


app.post("/login", async function(req, res) {
	res.end("Lol loser")
})
