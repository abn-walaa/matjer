let Discont = require('../db/module/discount')


let auth = async function (req, res, next) {
    try {

        let discont = await Discont.findOne({ code: req.body.discont })

        if (!discont) {
            throw new Error('There is no code like that')
        }
        req.discont = discont;
        next()
    } catch (error) {
        res.status(401).send({ error: "there is no discount like that" })
    }
}
module.exports = auth