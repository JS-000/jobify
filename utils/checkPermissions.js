import CustomAPIError from "../errors/index.js"

function checkPermissions(user, expectedUser) {
    if (expectedUser.toString() !== user) {
        throw new CustomAPIError(401, 'Not authorized to access this route')
    }
}

export default checkPermissions