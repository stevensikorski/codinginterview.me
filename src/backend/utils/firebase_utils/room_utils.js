import { getUser, updateUser, getUserSession } from "./realtime_db_utils.js";

// Checks if given user has an existing room
const userHasRoom = async (uid) => {
    const userSession = await getUserSession(uid)
    if (userSession && userSession.sessionId)
        return true
    return false
}

// Gets the room URL of current user (must be valid room)
const getRoomForUser = async (uid) => {
    const roomId = (await getUserSession(uid)).sessionId
    const room = `http://localhost:3000/rooms/${roomId}/ide`
    return room
}

// Deletes room (if exists) in realtime database for given uid 
const deleteRoom = async (uid) => {
    const dbUser = await getUser() 
    if (dbUser && dbUser.session && dbUser.session.sessionId){
        const updateUserInfo = {
            'session/sessionId': '', 
            'updatedAt': getCurrDateTime()
        }
        await updateUser(uid, updateUserInfo)
        console.log("user room deleted from rtdb.")
    }
}

export { deleteRoom, getRoomForUser, userHasRoom}