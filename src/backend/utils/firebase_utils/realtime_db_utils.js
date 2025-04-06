// Firebase Realtime Database utility functions
import { rtdb, auth } from '../../config_files/firebase-admin-config.js'

// Manipulation of 'User' Entity
// Fetches a user from database based on uid 
const getUser = async (uid) => {
    try {
        const userRef = rtdb.ref("users/" + uid)
        const snapShot = await userRef.once('value')
        if (!snapShot)
            throw new Error(`User with ${uid} not found in database!`)
        return snapShot.val()
    } catch (error) {
        console.log(error)
    }
}

// Set's a user object. Unlike update, this overwrites all other elements and
// should only be used during account registration
const setUser = async (uid, obj) => {
    try {
        const userRef = rtdb.ref("users/" + uid)
        await userRef.set(obj)
        console.log("user set in rtdb successfully")
    } catch (error) {
        console.log(error)
    }
}

// Updates a user's objects (including child elements 
const updateUser = async (uid, obj) => {
    try {
        const userRef = rtdb.ref("users/" + uid)
        await userRef.update(obj)
        console.log("user updated in rtdb successfully")
    } catch (error) {
        console.log(error)
    }
}

// Delete a user based on uid 
const deleteUser = async (uid) => {
    try {
        const userRef = rtdb.ref("users/" + uid)
        await userRef.remove()

        // Also delete from Firebase Authentication
        await auth.deleteUser(uid)

        console.log("user with uid " + uid + " deleted from realtime database and firebase authentication")
    } catch (error) {
        console.log(error)
    }
}

// Manipulation of 'Session' Entity
// Sets (creates) a new session given sessionId and obj 
const setSession = async (sid, obj) => {
    try {
        const sessionRef = rtdb.ref("sessions/" + sid)
        await sessionRef.set(obj)
        console.log("session set in rtdb successfully")
    } catch (error) {
        console.log(error)
    }
}

// Updates session given sessionId and object to update
const updateSession = async (sid, obj) => {
    try {
        const sessionRef = rtdb.ref("sessions/" + sid)
        await sessionRef.update(obj)
        console.log("session updated in rtdb successfully")
    } catch (error) {
        console.log(error)
    }
}

// Gets a session from Session entity based on sessionId 
const getSession = async (sid) => {
    try {
        const sessionRef = rtdb.ref("sessions/" + sid)
        const snapShot = await sessionRef.once('value')
        if (!snapShot)
            throw new Error(`Session %${sid} not found in database!`)
        return snapShot.val()
    } catch (error) {
        console.log(error)
    }   
}

// Gets the 'session' field for a user 
const getUserSession = async (uid) => {
    const dbUser = await getUser(uid) 
    return dbUser.session
}


export { deleteUser, getUser, setUser, updateUser, setSession, updateSession, getSession, getUserSession}