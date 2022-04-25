import { readFile } from 'fs/promises'

import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

import connectDB from '../db/connect.js'
import Job from '../models/Job.js'

async function start() {
    try {
        await connectDB(process.env.MONGO_URL)
        await Job.deleteMany()
        const jsonProducts = JSON.parse(await readFile(new URL('./MOCK2.json', import.meta.url)))
        await Job.create(jsonProducts)
        console.log('Success')
        process.exit(0)
    } catch (err) {
        console.log(err)
    }
}

start()