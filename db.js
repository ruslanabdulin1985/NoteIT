const mysql = require('mysql')
let connection

/**
 * Initializing connection to database with given config
 * @param {*} config 
 */
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

/**
 * Creating a new note
 * 
 * @param {*} name 
 * @param {*} text 
 * @param {*} authorid 
 * @param {*} category 
 */
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
    connection.query('SELECT nameusers, passwordusers FROM users WHERE nameusers = "' +  username + '"', (error, results, fields) =>  {
      if (error) 
        throw error
      if (results[0].passwordusers === password) {
        resolve(true)
      }
      resolve(false)
    })
  })
}

/**
 * Find a note by given id
 * @param {*} id 
 */
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

/**
 * Deleting a note by given id
 * @param {*} idnotes 
 */
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

/**
 * Adding a row to permissions table - for now READ only
 * @param {*} idobject 
 * @param {*} idnote 
 */
const insertShare = (idobject, idnote) => {
  const permission  = {idnote: idnote, idobject: idobject, permission: 'read'}
  connection.query('INSERT INTO permissions SET ?', permission, (error, results, fields) => {
    if (error) throw error
  })  
}

/**
 * EDit a note
 * @param {*} noteid 
 * @param {*} name 
 * @param {*} text 
 * @param {*} category 
 */
const update = (noteid, name, text, category) => {
  return new Promise(resolve => {
    connection.query('UPDATE noteit.notes SET namenotes= ?, bodynotes=?, category=? WHERE idnotes = ?', [name, text, category, noteid], (error, results, fields) =>  {
      if (error) {
        console.error(error)
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

const createUsr = (username, password) => {
  return new Promise(resolve => {
    const user  = {nameusers: username, passwordusers: password}
    connection.query('INSERT INTO users SET ?', user, (error, results, fields) => {
    if (error){
      console.error(error)
      resolve(false)
    } else {
      resolve(true)
    }
  })
  })
}

/**
 * Get only the notes created by the given user
 * @param {*} userid 
 */
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

/**
 * Get only notes shared with given user
 * @param {*} userid 
 */
const getSharedNotes = (userid) => {
  return new Promise(resolve => {
    connection.query(`SELECT * FROM noteit.general_view
    WHERE idnotes in(
      SELECT idnote
      FROM noteit.permissions 
      WHERE idobject = ${userid}
    ) GROUP BY nameusers`, (error, results, fields) =>  {
      if (error) 
        throw error
      else{

        console.log(results)
        resolve(results)
      }
        
    })
  })
}

/**
 * Get list of users with permissions for a given note
 * @param {*} noteid 
 */
const getAllowedUsersForNoteId = (noteid) => {
  return new Promise(resolve => {
    connection.query(`SELECT
      users.nameusers,
      permissions.permission
    FROM 
      permissions
    INNER JOIN users ON permissions.idobject=users.idusers
    WHERE permissions.idnote = ${noteid}
    ;`, (error, results, fields) =>  {
      if (error) {
        console.error(error)
        resolve([])
      } else {
        resolve(results)
      }
    })
  })
}

/**
 * GET list of users who has NO permissions for a fiven note
 * @param {*} noteid 
 */
const getUsersTheNoteIsNotSharedWith = (noteid) => {
  return new Promise(resolve => {
    connection.query(`SELECT
      * 
    FROM 
      users
    
    EXCEPT
    
    SELECT
      * 
    FROM 
      users
    WHERE 
      idusers
    IN (
      SELECT 
        idobject
      FROM
        permissions
      WHERE
        idnote = ${noteid}
    )`, 
    (error, results, fields) =>  {
      if (error) {
        throw error
      } else {
        resolve(results)
      }
    })
  })
}

/**
 * Get list of all the users
 */
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

/**
 * Get user entity by username only
 * @param {*} username 
 */
const getUserIdByName = (username) => {
  return new Promise(resolve => {
    connection.query(`SELECT idusers FROM users WHERE nameusers = '${username}'`, (error, results, fields) =>  {
      if (error) {
        console.error(error)
        resolve(null)
      } else {
        if (results[0]){
          resolve(results[0].idusers)
        } else {
          resolve(null)
        }
      }
    })
  })
}


module.exports = {
  init: initialise,
  findNote: findNote,
  deleteNote: deleteNote,
  createUsr: createUsr,
  getMyNotes: getMyNotes,
  update: update,
  auth: auth,
  createNote: createNote,
  getSharedNotes: getSharedNotes,
  getUserIdByName: getUserIdByName,
  getUsers: getUsers,
  insertShare: insertShare,
  getAllowedUsersForNoteId: getAllowedUsersForNoteId,
  getUsersTheNoteIsNotSharedWith: getUsersTheNoteIsNotSharedWith
}
