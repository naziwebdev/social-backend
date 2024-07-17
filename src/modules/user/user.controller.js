const userModel = require('../../models/User')



exports.editUser = async (req,res,next) => {
    try {

        const {name,username,email,password} = req.body
        
    } catch (error) {
        next(error)
    }
}


exports.editAvatar = async (req,res,next) => {
    try {
        
    } catch (error) {
        next(error)
    }
}