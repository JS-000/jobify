import express from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config()
import 'express-async-errors'
import morgan from 'morgan'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimiter from 'express-rate-limit'

import notFoundMiddleware from './middleware/not-found.js'  //Need to add .js don't know why!
import errorHandlerMiddleware from './middleware/error-handler.js'
import connectDB from './db/connect.js'
import authRouter from './routes/authRoutes.js'
import jobsRouter from './routes/jobsRoutes.js'
import auth from './middleware/auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// only when ready to deploy
app.use(express.static(path.resolve(__dirname, './client/build')))

if (process.env.NODE_ENV !== 'production')
    app.use(morgan('dev'))


app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(mongoSanitize())

const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many requests from this IP, please try again after 15 minutes',
})


app.use(apiLimiter)
app.use(express.json())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', auth, jobsRouter)

app.get('*', function (request, response) {
    response.sendFile(path.resolve(__dirname, './client/build', 'index.html'))
})

app.use(notFoundMiddleware)

app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

async function start() {
    try {
        await connectDB(process.env.MONGO_URL)
        console.log("Database connected successfully")
        app.listen(port, () => console.log(`Server started at port ${5000}`))
    } catch (err) {
        console.log(err)
    }
}

start()