import User from "../models/User.js"
import CustomAPIError from '../errors/index.js'

const register = async (req, res) => {
    const { name, email, password } = req.body
    if(!name || !email || !password) {
        throw new CustomAPIError(400, 'Please provide all values')
    }
    const user = await User.findOne({ email })
    if(user) {
        throw new CustomAPIError(400, 'Email already in use')
    }
    const newUser = await User.create({ name, email, password })
    const token = newUser.createJWT()   //probably delete created user if error occurs here
    res.status(201).json({
        user: {
            email: newUser.email,
            name: newUser.name,
            lastName: newUser.lastName,
            location: newUser.location
        }, token,
        location: newUser.location
    })
}

const login = async (req, res) => {
    const { email, password } = req.body
    if(!email || !password) {
        throw new CustomAPIError(400, "Please provide all values")
    }
    const user = await User.findOne({ email }).select('+password')
    if(!user) {
        throw new CustomAPIError(401, "Invalid Credentials")
    }
    if(!user.comparePassword(password)) {
        throw new CustomAPIError(401, "Invalid Credentials")
    }
    const token = user.createJWT()
    user.password = undefined
    res.status(200).json({
        user, token, location: user.location
    })
}

const updateUser = async (req, res) => {
    const { name, lastName, email, location } = req.body
    if(!name || !lastName || !email || !location) {
        throw new CustomAPIError('Please provide all values')
    }

    const user = await User.findOne({ _id: req.user.userId })
    user.email = email
    user.name = name
    user.lastName = lastName
    user.location = location

    await user.save()

    // const token = user.createJWT()   //not creting a new JWT as not changing the payload that is the userId,
    //  we have to change it if payload changes as jwt will store old information
    res.status(200).json({
        user,
        location: user.location
    })
}

export { register, login, updateUser }