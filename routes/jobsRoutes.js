import express from 'express'
import { createJob, deleteJob, getAllJobs, showStats, updateJob } from '../controllers/jobsController.js'
const jobsRouter = express.Router()

jobsRouter.route('/')
    .get(getAllJobs)
    .post(createJob)

jobsRouter.route('/stats')
    .get(showStats)

jobsRouter.route('/:id')
    .patch(updateJob)
    .delete(deleteJob)

export default jobsRouter