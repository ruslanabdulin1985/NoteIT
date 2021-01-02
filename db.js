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

const createNote = () => {
  const note  = {bodynotes: 'test', authornotes: 1, category: 'home'}
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

const find = () => {
  // find note
}


const findAll = () => {
  // find all Note
}


const deleteOne = () => {
  // delete a note
}

const update = () => {

  // edit a note
}

const createUsr = () => {

}

const getMyNotes = (username) => {
  return new Promise(resolve => {
    connection.query('SELECT nameusers, passwordusers FROM users WHERE nameusers = "' + username + '"', (error, results, fields) =>  {
      if (error) 
        throw error
      else
      resolve(results)
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




module.exports = {
  init: initialise,
  find: find,
  findAll: findAll,
  deleteOne: deleteOne,
  createUsr: createUsr,
  getMyNotes: getMyNotes,
  update: update,
  auth: auth,
  createNote: createNote,
  getSharedNotes: getSharedNotes
}
