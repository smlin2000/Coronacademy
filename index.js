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
var users = {
	"willard": {
		name: "Willard",
		desc: "Teaching Algebra\nLearning Calculus",
		password: "12345",
		courses: {
			Algebra: "Mastered",
			CS: "Learning"
		},
	},
	"lily": {
		name: "Lily",
		desc: "Teaching Algebra\nLearning Combinatorics and CS",
		password: "12345",
		courses: {
			Algebra: "Mastered",
			Combinatorics: "Learning",
			CS: "Learning"
		},
	},
	"geoffrey": {
		name: "Geoffrey",
		desc: "Teaching Algebra\nLearning JavaScript",
		password: "12345",
		courses: {
			Algebra: "Mastered",
			Combinatorics: "Learning",
			CS: "Learning"
		},
	},
	"johnsmith932": {
		name: "JohnSmith932",
		password: "12345",
		courses: {
			Algebra: "Mastered",
			Geometry: "Mastered",
			Calculus: "Mastered",
		}
	}
}
wss.on('connection', async ws => {
	connections.push(ws)

	// Send the last 10 messages right away
	ws.send(messageHistory.slice(-10).join("\n"))

	ws.on('message', async msg => {
		if (!ws.name) {
			ws.name = msg
			if (users[ws.name.toLowerCase()]) {
				ws.user = users[ws.name.toLowerCase()]
			}
			return
		}

		// Recieved a message; echo it back to everyone
		connections.forEach(socket => socket.send(ws.name + ": " + msg))
		messageHistory.push(ws.name + ": " + msg)
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

app.post("/login", async function(req, res) {
	let body = req.body
	let user = users[body.name.toLowerCase()]
	if (user && user.password === body.password) {
		res.end(JSON.stringify(user))
		return
	}
	res.end("false")
})
app.post("/signup", async function(req, res) {
	let body = req.body
	let name = body.name.toLowerCase()
	if (users[name]) {
		res.end("400")
	} else {
		users[name] = body
		res.end("200")
	}
})

app.get("/online", async function(req, res) {
	let online = []
	for (let ws of connections.filter(c => c.name)) {
		if (ws.user) {
			online.push({
				name: ws.user.name,
				desc: ws.user.desc
			})
		} else {
			online.push({
				name: ws.name,
				desc: "Logged Out"
			})
		}
	}
	res.send(JSON.stringify(online))
})