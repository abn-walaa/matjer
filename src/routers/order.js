let express = require('express')
let router = express.Router();
let Order = require('../db/module/order');
let auth = require('../auth/auth');
let checkdiscount = require('../auth/checkdiscount')
let authAdmin = require('../auth/authAdmin');

// اضافة طلب
router.post('/order/new', auth, checkdiscount, async (req, res) => {

    let theAlloawd = ['adress', "phoneNumber", "prodects", "discont"]
    let keys = Object.keys(req.body)

    let check = keys.every(e => theAlloawd.includes(e))
    if (!check) {
        return res.status(400).send({ "error": "input" })
    }
    try {
        let order = new Order({ userID: req.user.id, adress: req.body.adress, phoneNumber: req.body.phoneNumber, discont: req.discont.id })
        let prics = 0;

        // اضافة معلومات الئ المنتجات
        req.body.prodects.forEach(e => {
            let whoMany = e.whoMany
            order.prodects = order.prodects.concat({ prodect: e.prodect, whoMany })
        });

        await order.populate('prodects.prodect')
        // تخزين السعر
        order.prodects.forEach(e => {
            for (let i = 0; i < e.whoMany; i++) {
                prics = e.prodect.prics + prics;
            }

        })
        order.prics = prics;
        // تطبيق الخصم
        await order.populate('discont')

        order.prics = prics - (prics * (order.discont.dis / 100))
        await order.save()

        res.send(order)

    } catch (error) {
        res.status(400).send(error)
    }
})
// اظهار الطلبات العضو
router.get('/myorders', auth, async (req, res) => {
    try {
        let orders = await Order.find({ userID: req.user.id })
        if (!orders) {
            return res.send({ error: "Empty" })
        }
        res.send(orders)
    } catch (error) {
        res.status(400).send(error)
    }
})
// جلب الطلبات الئ ادمن
router.get('/admin/orders', authAdmin, async (req, res) => {
    try {
        let orders = await Order.find({});
        if (!orders) {
            return res.send({ error: "Empty" })
        }
        res.send(orders)
    } catch (error) {
        res.status(400).send(error)
    }
})
// تاكيد حالة الطلب
router.patch('/admin/order', authAdmin, async (req, res) => {
    try {
        let order = await Order.findById(req.body.id)
        if (!order) {
            res.status(404).send()
        }
        order.status = req.body.status || "done"
        await order.save()
        res.send({ done: true })
    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router