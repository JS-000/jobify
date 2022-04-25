import express from 'express'
import { login, register, updateUser } from '../controllers/authController.js'
import auth from '../middleware/auth.js'
const authRouter = express.Router()

authRouter.route('/register').post(register)
authRouter.route('/login').post(login)
authRouter.route('/update-user').patch(auth, updateUser)

export default authRouter