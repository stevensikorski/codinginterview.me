
// Custom firebase utility functions
import { verifyJWTToken } from "../utils/firebase_utils/auth_utils.js"
import { getUser } from "../utils/firebase_utils/realtime_db_utils.js"

// Upon invocations, mounts the specified route to backend
const registerSessionRoutes = (app) => {
    app.post("/createsession", async (req, res) => {
        const { uid, jwtToken } = req.body 
        verifyJWTToken(jwtToken)

        // fetch the user from database 
        const dbUser = await getUser(uid) 
        console.log(dbUser)
    })
}

export { registerSessionRoutes }