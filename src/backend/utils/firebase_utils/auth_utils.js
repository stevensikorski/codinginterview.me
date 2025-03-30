// Contains useful firebase admin utility functions related to authentication
// Firebase settings & SDK
import { auth } from "../../config_files/firebase-admin-config.js"; // Firebase API object and initialized firebase object
import { deleteUser } from "./realtime_db_utils.js";

// List all users
const listAllUsers = async (nextPageToken) => {
    var userRecords = []
    // List batch of users, 1000 at a time.
    await auth
      .listUsers(1000, nextPageToken)
      .then(async (listUsersResult) => {
        const users = listUsersResult.users
        for (const userRecord of users){
            // console.log('user', userRecord.toJSON());
            // Manage each user here
            userRecords.push(userRecord)
        }
        // if (listUsersResult.pageToken) {
        //   // List next batch of users.
        // //   await listAllUsers(listUsersResult.pageToken);
        // }
      })
      .catch((error) => {
        console.log('Error listing users:', error);
      });
    console.log(userRecords)
    return userRecords
  };

// Deletes user from Firebase Authentication and firebase rtdb
const deleteAllUsers = async () => {
    const userRecords = await listAllUsers()
    for (const user of userRecords){
        try{
            // Deletes each user by userid
            await auth.deleteUser(user.uid)
                .then(() => {
                    console.log("successfully deleted user account")
                })
                .catch((error) => {
                    console.log("error deleting user: ", error)
                })
            await deleteUser(user.uid)
        } catch (error) {
            console.log(error)
        }
    }
}
// Invoke below to delete all users
// deleteAllUsers()

// JWT token creation given a user id (uid)
const createJWTToken = async (uid) => {
    try {
        const jwtToken = await auth
            .createCustomToken(uid)
            .then((customToken) => {
                return customToken 
            })
        return jwtToken
    } catch (error){
        console.log(error)
    }
}

// Compare user's JWT token in localStorage to the one assigned by firebase
const verifyJWTToken = async (jwtToken) => {
    try {
        const decodedToken = await auth.verifyIdToken(jwtToken)
        console.log(decodedToken)
    } catch (error){
        console.log(error)
    }
}





export { listAllUsers, deleteAllUsers, createJWTToken, verifyJWTToken }