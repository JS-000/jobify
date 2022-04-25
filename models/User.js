import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minLength: 3,
        maxLength: 20,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        // validate: {
        //     validator: validator.isEmail,
        //     message: 'Please provide a valid email'
        // },
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minLength: 6,
        select: false
    },
    lastName: {
        type: String,
        trim: true,
        maxLength: 20,
        default: 'lastName'
    },
    location: {
        type: String,
        trim: true,
        maxLength: 20,
        default: 'my city'
    }
})

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.createJWT = function() {
    return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
}

userSchema.methods.comparePassword = async function (plaintextPassword) {
    const isMatch = await bcrypt.compare(plaintextPassword, this.password)
    return isMatch
}

const User = mongoose.model('User', userSchema)


export default User