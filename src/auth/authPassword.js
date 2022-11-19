let User = require('../db/module/users')
let jwt = require('jsonwebtoken')

let auth = async function (req, res, next) {
    try {
        let token = await req.params.token
        jwt.verify(token, process.env.JWT)
        let id = jwt.decode(token, process.env.JWT)
        let user = await User.findOne({ _id: id })
        if (!user) {
            throw new Error('no ascess')
        }
        req.user = user

        next()
    } catch (error) {
        res.status(401).send('no ascess')
    }
}
module.exports = auth