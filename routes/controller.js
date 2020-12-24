const express = require('express')
// const members = require('../members.js') // .. outside api folder .. outside routes folder

const db = require('../db')
const users = require('../users')
// const session = require('express-session')

const router = express.Router()

router.get('/', (req, res) => {
  res.render('index', { title: 'home', name: 'main' })
})

router.get('/snippets', async (req, res) => {
  let snippets = []
  snippets = await db.findAll({})
  res.render('all_snippets', { title: 'Snippets', snippets: snippets })
})

router.get('/my_snippets', async (req, res) => {
  if (req.session.user) {
    let snippets = []
    snippets = await db.findAll({ user: req.session.user })
    res.render('my_snippets', { title: 'Snippets', snippets: snippets.reverse() })
  } else { res.render('error', { error: 'User Not Found' }) }
})

router.post('/add_snippet', async (req, res) => {
  if (req.session.user) {
    await db.create(req.body.name, req.body.code, req.session.user, [])
    res.send({ st: 'OK' })
  } else { res.send({ st: 'FAIL' }) }
})

router.post('/edit_snippet', async (req, res) => {
  if (req.session.user) {
    // console.log(req.body.id, req.body.name, req.body.code)
    await db.update(req.body.id, req.body.name, req.body.code, req.session.user, [])
    res.send({ st: 'OK' })
  } else { res.send({ st: 'FAIL' }) }
})

router.post('/reg', async (req, res) => {
  await users.find(req.body.username).then(foundUser => {
    if (foundUser && foundUser.user === req.body.username) {
      res.render('error', { error: 'SUCH USER EXIST' })
    } else {
      users.createUsr(req.body.username, req.body.password)
      req.session.user = req.body.username
      res.redirect(301, '/my_snippets')
    }
  })
})

router.get('/delete_snippet/:id', async (req, res) => {
  await db.deleteOne(req.params.id)
  res.redirect(301, '/my_snippets')
})

router.post('/auth', async (req, res) => {
  const isAuthorized = await users.auth(req.body.username, req.body.password)
  await users.find(req.body.username).then(foundUser => {
    if (foundUser && isAuthorized) {
      req.session.user = foundUser.user
      res.redirect(301, '/my_snippets')
      // res.send({url:'/homepage'})
    } else {
      req.session.user = null
      res.redirect(301, '/my_snippets')
      // res.status(400).send('Bad Request')
    }
  })

  // console.log('auth ' + req.session.user)
})

router.get('/get_user', async (req, res) => {
  if (req.session.user) {
    res.send({ usr: req.session.user })
  } else { res.send({ usr: 'none' }) }
})

router.get('/homepage', async (req, res) => {
  if (req.session.user) {
    res.render('user_home', { user: req.session.user })
  } else { res.status(404).send('Not found') }
})

router.get('/login', async (req, res) => {
  req.session.user = null
  res.render('login')
})

router.get('/get_current_user', async (req, res) => {
  res.json({ user: 'RR' }) // req.session.user
})

router.get('/snippet/edit/:id', async (req, res) => {
  // const [snippetName, authorName, snippetBody] = ['', '', '']
  if (req.session.user && req.params.id.length === 24) {
    await db.find(req.params.id).then(r => {
      if (r) {
        const snippetId = r._id
        const snippetName = r.name
        const authorName = r.user
        const snippetBody = r.body
        res.render('snippet_edit', { title: 'snippet', id: snippetId, name: snippetName, author: authorName, body: snippetBody })
      } else {
        res.render('error', { error: 'SNIPPET NOT FOUND' })
      }
    })
  } else { res.render('error', { error: 'EDITING FORBIDEN FOR NOT REGISTRED USERS' }) }
})

router.get('/register', async (req, res) => {
  res.render('register')
})

router.get('/snippet/add', async (req, res) => {
  if (req.session.user) {
    res.render('snippet_edit', { title: 'snippet add', author: req.session.user })
  } else { res.render('login') }
})

router.get('/snippets/:id', async (req, res) => {
  // const [snippetName, authorName, snippetBody] = ['', '', '']
  if (req.params.id.length === 24) {
    await db.find(req.params.id).then(r => {
      if (r) {
        let deleteStatus = 'NO'
        if (r.user === req.session.user) {
          deleteStatus = 'YES'
        }
        const snippetId = r._id
        const snippetName = r.name
        const authorName = r.user
        const snippetBody = r.body
        res.render('snippet', { title: 'snippet', name: snippetName, author: authorName, body: snippetBody, id: snippetId, deleteStatus: deleteStatus })
      } else {
        res.render('error', { error: 'SNIPPET NOT FOUND' })
      }
    })
  } else { res.render('error', { error: 'SNIPPET NOT FOUND' }) }
})

module.exports = router
