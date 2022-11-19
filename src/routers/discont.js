let express = require('express')
let router = new express.Router();
let Discount = require('../db/module/discount')
let authAdmin = require('../auth/authAdmin');

// اضافة خصم جديد
router.post('/discount/add', authAdmin, async (req, res) => {
    let theAlloawd = ['code', 'dis']
    let check = Object.keys(req.body).every(e => theAlloawd.includes(e))
    console.log(check)
    if (!check) {
        return res.status(400).send({ error: "input error" })
    }
    try {
        let dis = new Discount(req.body);
        await dis.save()
        res.send({ "done": true })
    } catch (error) {
        res.status(400).send(error)
    }
})
//  عرض اكواد الخصومات 
router.get('/discount', authAdmin, async (req, res) => {
    try {
        let dis = await Discount.find({});
        if (!dis) {
            return res.send({ error: "empty" })
        }
        if (dis.length === 0) {
            return res.send({ error: "empty" })
        }
        res.send(dis)
    } catch (error) {
        res.status(400).send(error)
    }
})
//  حذف كود
router.delete('/discount/del/', authAdmin, async (req, res) => {
    try {
        let dis = await Discount.findOne({ code: req.body.code })
        if (!dis) {
            return res.status(404).send()
        }
        await dis.remove();
        res.send({ done: true })
    } catch (error) {
        res.status(400).send(error)
    }
})
// تعديل معلومات الكود
router.patch('/discount/updata/:id', authAdmin, async (req, res) => {
    let theAlloawd = ['code', 'dis']
    let keys = Object.keys(req.body)
    let check = keys.every(e => theAlloawd.includes(e))
    if (!check) {
        return res.status(400).send({ error: "input error" })
    }
    try {
        let dis = await Discount.findOne({ code: req.params.id })
        if (!dis) {
            return res.status(404).send()
        }

        keys.forEach(e => {
            dis[e] = req.body[e]
        })

        await dis.save();
        res.send({ done: true })
    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router;