const express = require('express')

const db = require('../db')
const users = require('../users')

const router = express.Router()

router.get('/', (req, res) => {
  res.render('index', { title: 'home', name: 'main' })
})

router.get('/my_notes', async (req, res) => {
  if (req.session.user && req.session.userid) {
    // console.log(req.session.userid)
    let notes = await db.getMyNotes(req.session.userid)
    res.render('my_notes', { title: 'Notes', notes: notes.reverse() })
  } else {
    res.render('error', {error : 'permission denied'})
  }
})

router.get('/shared_notes', async (req, res) => {
  if (req.session.user && req.session.userid) {
    let notes = await db.getSharedNotes(req.session.userid)
    res.render('shared_notes', { title: 'Notes', notes: notes.reverse() })
  } else {
    res.render('error', {error : 'permission denied'})
  }
})

router.post('/add_note', async (req, res) => {
  if (req.session.user) {
    await db.createNote(req.body.name, req.body.text, req.session.userid, req.body.category)
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


router.post('/share_apply', async (req, res) => {
  if (req.session.user) {
    // console.log(req.body.idusers, req.body.idnotes)
    db.insertShare(req.body.idusers, req.body.idnotes)
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
  if (req.session.user){
    const userid = await db.getUserIdByName(req.session.user)
    const note = await db.findNote(req.params.id)
    let authornote = 0
    if (note) {
      authornote = note.authornotes
    }

    if (userid === authornote){
      const result = await db.deleteNote(req.params.id)
      if (result){
        res.redirect(301, '/my_notes')
      } else {
        res.render('error', ({error:"Could not delete the note"}))
      }
    } else {
      res.render('error', ({error:"Permission denied"}))
    }
  } else {
    res.render('error', ({error:"Permission denied for guest user"}))
  }
})

router.post('/auth', async (req, res) => {
  const isAuthorized = await db.auth(req.body.username, req.body.password)
  if (isAuthorized) {
    const id = await db.getUserIdByName(req.body.username)
    req.session.userid = id
    req.session.user = req.body.username
    res.redirect(301, '/my_notes')
  } else {
    req.session.user = null
    res.redirect(301, '/')
  }
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

router.get('/notes/share/:id', async (req, res) => {
  if (req.session.user){
    const users = await db.getUsers()
    const note = await db.find(req.params.id)
    res.render('note_share', {users : users, note: note})
  }
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

  const note = await db.findNote(req.params.id)
  if (note) {
    res.render('note', { title: 'note', name: note.namenotes, author: note.nameusers, text: note.bodynotes, id: note.idnotes, deleteStatus: 'YES', category: note.category })


      // .then(r => {
    //   if (r) {
    //     let deleteStatus = 'NO'
    //     if (r.user === req.session.user) {
    //       deleteStatus = 'YES'
    //     }
    //     const snippetId = r._id
    //     const snippetName = r.name
    //     const authorName = r.user
    //     const snippetBody = r.body
    //   } else {
    //   }
    // })
  } else { res.render('error', { error: 'NOTE NOT FOUND' }) }
})

module.exports = router
