import { getUser, updateUser } from "./realtime_db_utils.js";

// Deletes room (if exists) in realtime database for given uid 
const deleteRoom = async (uid) => {
    const user = await getUser() 
    if (user && user.session && user.session.sessionId){
        const updateUserInfo = {
            'session/sessionId': '', 
            'updatedAt': getCurrDateTime()
        }
        await updateUser(uid, updateUserInfo)
        console.log("user room deleted from rtdb.")
    }
}

export { deleteRoom }