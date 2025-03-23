import { rtdb } from '../../config_files/firebase-admin-config.js'

// Delete a user based on uid from realtime database
const deleteUser = async (uid) => {
    const userRef = rtdb.ref("users/" + uid)
    try {
        await userRef.remove()
        console.log("user with uid " + uid + " deleted from realtime database")
    }
    catch (error) {
        console.log(error)
    }
}

export { deleteUser }