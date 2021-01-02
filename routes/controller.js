const express = require('express')
// const members = require('../members.js') // .. outside api folder .. outside routes folder

const db = require('../db')
const users = require('../users')
// const session = require('express-session')

const router = express.Router()

router.get('/', (req, res) => {
  res.render('index', { title: 'home', name: 'main' })
})

router.get('/notes', async (req, res) => {
  let snippets = []
  snippets = await db.findAll({})
  res.render('all_notes', { title: 'Snippets', snippets: snippets })
})

router.get('/my_notes', async (req, res) => {
  if (req.session.user) {
    let notes = await db.getMyNotes()
    res.render('my_notes', { title: 'Notes', notes: notes.reverse() })
  }
})

router.get('/shared_notes', async (req, res) => {
  if (req.session.user) {
    let notes = await db.getSharedNotes(1)
    res.render('shared_notes', { title: 'Notes', notes: notes.reverse() })
  }
})

router.post('/add_note', async (req, res) => {
  if (req.session.user) {
    await db.createNote(req.body.name, req.body.body, req.session.user, req.session.category)
    res.send({ st: 'OK' })
  } else { res.send({ st: 'FAIL' }) }
})

router.post('/edit_note', async (req, res) => {
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
      res.redirect(301, '/my_notes')
    }
  })
})

router.get('/delete_note/:id', async (req, res) => {
  await db.deleteOne(req.params.id)
  res.redirect(301, '/my_notes')
})

router.post('/auth', async (req, res) => {
  const isAuthorized = await db.auth(req.body.username, req.body.password)
  if (isAuthorized) {
    req.session.user = req.body.username
    res.redirect(301, '/my_notes')
  } else {
    req.session.user = null
    res.redirect(301, '/')
  }
    
  // await db.findUser(req.body.username).then(foundUser => {
  //   if (foundUser && isAuthorized) {
  //     req.session.user = foundUser.user
  //     res.redirect(301, '/my_notes')
  //     // res.send({url:'/homepage'})
  //   } else {
  //     req.session.user = null
  //     res.redirect(301, '/my_notes')
  //     // res.status(400).send('Bad Request')
  //   }
  // })

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

router.get('/note/edit/:id', async (req, res) => {
  // const [snippetName, authorName, snippetBody] = ['', '', '']
  if (req.session.user && req.params.id.length === 24) {
    await db.find(req.params.id).then(r => {
      if (r) {
        const snippetId = r._id
        const snippetName = r.name
        const authorName = r.user
        const snippetBody = r.body
        res.render('note_edit', { title: 'snippet', id: snippetId, name: snippetName, author: authorName, body: snippetBody })
      } else {
        res.render('error', { error: 'NOTE NOT FOUND' })
      }
    })
  } else { res.render('error', { error: 'EDITING FORBIDEN FOR NOT REGISTRED USERS' }) }
})

router.get('/register', async (req, res) => {
  res.render('register')
})

router.get('/note/add', async (req, res) => {
  if (req.session.user) {
    res.render('note_edit', { title: 'note add', author: req.session.user })
  } else { res.render('login') }
})

router.get('/notes/:id', async (req, res) => {
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
        res.render('note', { title: 'snippet', name: snippetName, author: authorName, body: snippetBody, id: snippetId, deleteStatus: deleteStatus })
      } else {
        res.render('error', { error: 'NOTE NOT FOUND' })
      }
    })
  } else { res.render('error', { error: 'NOTE NOT FOUND' }) }
})

module.exports = router
