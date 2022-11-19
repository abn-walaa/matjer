let User = require('../db/module/users')
let jwt = require('jsonwebtoken')

let auth = async function (req, res, next) {
    try {
        let token = await req.header("Authorization").replace('Bearer ', '')
        let id = jwt.decode(token, process.env.JWT)
        let user = await User.findOne({ _id: id, "tokens.token": token })
        if (!user) {
            throw new Error('Plz Authorization')
        }

        if (user.rol !== "admin") {
            throw new Error('u are not the admin')
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send('Plz Authorization')
    }
}
module.exports = auth