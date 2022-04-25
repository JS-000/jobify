const errorHandlerMiddleware = (err, req, res, next) => {
    const defaultError = {
        statusCode: err.statusCode || 500,
        msg: err.message || "Something went wrong, try again later"
    }
    if (err.name === 'ValidationError') {    //missing fields and validation in general
        defaultError.statusCode = 400
        defaultError.msg = Object.values(err.errors).map(item => item.message).join(', ')
    }
    else if (err.code && err.code === 11000) {   //unique fields
        defaultError.statusCode = 400
        defaultError.msg = `${Object.keys(err.keyValue)} field has to be unique`
    }
    // res.status(defaultError.statusCode).json({ msg: err })
    res.status(defaultError.statusCode).json({ msg: defaultError.msg })
}

export default errorHandlerMiddleware