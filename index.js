const express = require('express')
const path = require('path')
const db = require('./db')
const users = require('./users')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cookieParser())
app.use(session({ secret: 'Shh, its a secret!' }))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', require('./routes/controller'))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// app.get('/', function (req, res) {
//   res.send('Hello World')
// })

db.init()
users.init()
app.listen(PORT, () => console.log(`server is running on ${PORT}`))
