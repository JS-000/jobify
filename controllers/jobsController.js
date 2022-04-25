import Job from "../models/Job.js"
import CustomAPIError from "../errors/index.js"
import checkPermissions from "../utils/checkPermissions.js"
import mongoose from "mongoose"
import moment from "moment"

const createJob = async (req, res) => {
    const { position, company } = req.body
    if (!position || !company) {
        throw new CustomAPIError(400, "Please provide all values")
    }
    req.body.createdBy = req.user.userId

    const newJob = await Job.create(req.body)

    res.status(201).json({ job: newJob })
}

const deleteJob = async (req, res) => {
    const { id } = req.params

    const job = await Job.findOne({ _id: id })

    if (!job) {
        throw new CustomError(404, `No job with id : ${id}`)
    }
    checkPermissions(req.user.userId, job.createdBy)
    await Job.findByIdAndDelete(id)
    res.status(200).json({ msg: 'Job removed successfully' })
}

const getAllJobs = async (req, res) => {
    const { search, status, jobType, sort } = req.query
    const queryObj = {
        createdBy: req.user.userId  //should be a parameter in every query
    }
    if (status !== 'all') {
        queryObj.status = status
    }
    if (jobType !== 'all') {
        queryObj.jobType = jobType
    }
    if (search) {
        queryObj.position = { $regex: search, $options: 'i' }
    }
    let results = Job.find(queryObj)
    if (sort === 'latest') {
        results = results.sort('-createdAt')
    }
    if (sort === 'oldest') {
        results = results.sort('createdAt')
    }
    if (sort === 'a-z') {
        results = results.sort('position')
    }
    if (sort === 'z-a') {
        results = results.sort('-position')
    }
    // const totalJobs = await results
    const totalJobs = await Job.countDocuments(queryObj)
    const page = req.query.page || 1
    const limit = req.query.limit || 10
    const skip = (page - 1) * limit
    const jobs = await results.skip(skip).limit(limit)
    res.status(200).json({ jobs, totalJobs, numOfPages: Math.ceil(totalJobs / limit) })
}

const updateJob = async (req, res) => {
    const { id } = req.params
    const { company, position } = req.body

    if (!company || !position) {
        throw new CustomAPIError(400, 'Please provide all values')
    }
    const job = await Job.findOne({ _id: id })
    if (!job)
        throw new CustomAPIError(404, `No job found with id ${id}`)

    checkPermissions(req.user.userId, job.createdBy)

    const newJob = await Job.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true //runs only on values provided(here in req.body)
    })
    res.status(200).json({
        job: newJob
    })
}

const showStats = async (req, res) => {
    let stats = await Job.aggregate([
        {
            $match: {
                createdBy: mongoose.Types.ObjectId(req.user.userId)
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ])
    // res.status(200).json({ stats })
    let monthlyApplications = await Job.aggregate([
        {
            $group: {
                _id: {
                    year: {
                        $year: '$createdAt'
                    },
                    month: {
                        $month: '$createdAt'
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': -1, '_id.month': -1 }
        },
        { $limit: 6 }
    ])
    monthlyApplications = monthlyApplications.map(application => {
        const { _id: { month, year }, count } = application
        const date = moment().month(month - 1).year(year).format('MMM Y')
        return { date, count }
    }).reverse()
    stats = stats.reduce((previousValue, currentValue) => {
        const { _id, count } = currentValue
        previousValue[_id] = count
        return previousValue
    }, {})

    const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0,
    }

    res.status(200).json({ defaultStats, monthlyApplications })
}

export { createJob, deleteJob, getAllJobs, updateJob, showStats }