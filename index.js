const express = require('express')
const path = require('path')
const db = require('./db')
const users = require('./users')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const configIni = require('config.ini')

let config = configIni.load('./config.ini')
const app = express()
const PORT = process.env.PORT || 5000

app.use(cookieParser())
app.use(session({ secret: 'Shh, its a secret!' }))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', require('./routes/controller'))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')


db.init(config)
users.init()

// db.create()

app.listen(PORT, () => console.log(`server is running on ${PORT}`))
