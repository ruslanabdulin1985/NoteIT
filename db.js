const mysql = require('mysql')
let connection

const initialise = (config) => {
  connection = mysql.createConnection({
    host     : config.mysqldatabase.host,
    user     : config.mysqldatabase.user,
    password : config.mysqldatabase.password,
    database : config.mysqldatabase.database
  })

  connection.connect((err)=>{
    if (err) {
      console.error('error during connection to db:\n'+err)
      return
    }
    console.log('Connected to db')
  })
}

const createNote = (name, text, authorid, category) => {
  const note  = {bodynotes: text, authornotes: authorid, namenotes:name, category: category}
  connection.query('INSERT INTO notes SET ?', note, (error, results, fields) => {
    if (error) throw error
  })
}

/**
 * Authorisation
 * 
 * Takes two aruguments : username and password. If provided arguments match to what is stored in db then
 * return a promise true, otherwie promise false
 */
const auth = (username, password) => {
  return new Promise(resolve => {
    connection.query('SELECT nameusers, passwordusers FROM users WHERE nameusers = "' + username + '"', (error, results, fields) =>  {
      if (error) 
        throw error
      if (results[0].passwordusers === password) {
        resolve(true)
      }
      resolve(false)
    })
  })
}

const findNote = (id) => {
  console.log(id)
  return new Promise(resolve => {
    connection.query('SELECT * FROM noteit.general_view WHERE idnotes = "' + id + '"', (error, results, fields) =>  {
      if (error) 
        throw error
      if (results) {
        resolve(results[0])
      }
      resolve([])
    })
  })  
}


const findAll = () => {
  // find all Note
}


const deleteNote = (idnotes) => {
  return new Promise(resolve => {
    connection.query('DELETE FROM noteit.notes WHERE idnotes = "'+idnotes+'"', function (error, results, fields) {
      if (error) {
        console.error(error);
        resolve(false)
      } else {
        resolve(true)
      } 
    })
  })
}

const insertShare = (idobject, idnote) => {
  const permission  = {idnote: idnote, idobject: idobject, permission: 'read'}
  connection.query('INSERT INTO permissions SET ?', permission, (error, results, fields) => {
    if (error) throw error
  })  
}

const update = () => {

  // edit a note
}

const createUsr = () => {

}

const getMyNotes = (userid) => {
  return new Promise(resolve => {
    connection.query(`SELECT * FROM noteit.general_view WHERE authornotes = '${userid}'`, (error, results, fields) =>  {
      if (error) {
        throw error
        resolve([])
      } else {
        resolve(results)
      }
    })
  })
}

const getSharedNotes = (userid) => {
  return new Promise(resolve => {
    connection.query(`SELECT * 
    FROM noteit.general_view
    WHERE authornotes in(
      SELECT idusers 
        FROM noteit.userstogroups 
        WHERE idgroups IN (
        SELECT idgroups 
            FROM noteit.userstogroups 
            WHERE idusers = '${userid}'))
    AND authornotes != ${userid}
    ;`, (error, results, fields) =>  {
      if (error) 
        throw error
      else{

        console.log(results)
        resolve(results)
      }
        
    })
  })
}

const getUsers = () => {
  return new Promise(resolve => {
    connection.query(`SELECT * FROM users`, (error, results, fields) =>  {
      if (error) {
        throw error
      } else {
        resolve(results)
      }
    })
  })
}

const getUserIdByName = (username) => {
  return new Promise(resolve => {
    connection.query(`SELECT idusers FROM users WHERE nameusers = '${username}'`, (error, results, fields) =>  {
      if (error) {
        throw error
      } else {
        console.log(results[0])
        resolve(results[0].idusers)
      }
    })
  })
}


module.exports = {
  init: initialise,
  findNote: findNote,
  findAll: findAll,
  deleteNote: deleteNote,
  createUsr: createUsr,
  getMyNotes: getMyNotes,
  update: update,
  auth: auth,
  createNote: createNote,
  getSharedNotes: getSharedNotes,
  getUserIdByName: getUserIdByName,
  getUsers: getUsers,
  insertShare: insertShare
}
