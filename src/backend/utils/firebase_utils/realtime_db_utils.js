// Firebase Realtime Database utility functions
import { rtdb } from '../../config_files/firebase-admin-config.js'

// Fetches a user from database based on uid 
const getUser = async (uid) => {
    try {
        const userRef = await rtdb.ref("users/" + uid)
        return userRef
    } catch (error) {
        console.log(error)
    }
}

// Delete a user based on uid 
const deleteUser = async (uid) => {
    try {
        const userRef = await rtdb.ref("users/" + uid)
        await userRef.remove()
        console.log("user with uid " + uid + " deleted from realtime database")
    } catch (error) {
        console.log(error)
    }
}

export { deleteUser, getUser }