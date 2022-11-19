let express = require('express');
let router = new express.Router();
const Prodect = require('../db/module/prodects')
let authProdect = require('../auth/addProdect')
let multer = require('multer');
let authAdmin = require('../auth/addProdect')
const User = require('../db/module/users');
let sharp = require('sharp')
let pics = multer({
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
            console.log('hi')
            return cb(new Error('Should be (PNG , JPG or JPEG)'))
        }

        return cb(undefined, true)
    }
})
// اضافة منتج
router.post('/prodect/add', pics.fields([{ name: "pics" }]), authProdect, async (req, res) => {

    try {
        let prodect = new Prodect({ ...req.body, "owner": req.user.id, })
        if (req.files.pics) {
            for (i = 0; i < req.files.pics.length; i++) {
                let pic = await sharp(req.files.pics[i].buffer).png().toBuffer();
                prodect.pics = prodect.pics.concat({ "pic": pic })
                prodect.pics_url = prodect.pics_url.concat({ "pic": ("http://localhost:3000/prodect/" + prodect._id + "?i=" + i) })
            }
        }
        if (req.user.rol === "team") {
            prodect.staticPublic = "on-hold"
        }
        await prodect.save()
        res.send(prodect)
    } catch (error) {
        res.status(400).send(error)
    }
})
//حذف المنتج 
router.delete('/prodect/del/:id', authProdect, async (req, res) => {
    let id = req.params.id
    try {
        let prodect = await Prodect.findById(id);
        await prodect.remove()
        res.send({ done: true })
    } catch (error) {
        res.status(400).send(error)
    }
})
// جلب صورة المنتج
router.get('/prodect/:id', async (req, res) => {
    let id = req.params.id
    let index = req.query.i
    try {
        let prodect = await Prodect.findOne({ _id: id })
        if (!prodect) {
            throw new Error('Not found')
        }
        res.set('content-type', 'image/png')
        res.send(prodect.pics[index].pic)
    } catch (error) {
        res.status(400).send(error)
    }
})
// جلب المنتجات 
router.get('/prodects', async (req, res) => {
    let data = new Date();
    let limit = req.query.l || 0;
    let skip = req.query.s || 0
    let prodects = await Prodect.find({ staticPublic: "public" }, {}, { limit, skip }).populate({ path: 'owner' })
    res.send(prodects)
    console.log(new Date() - data)
})
// تحديث معلومات المنتج
router.post('/prodect/updata/:id', authProdect, async (req, res) => {
    let theAllowd = ['title', 'disc', 'type'];
    let keys = Object.keys(req.body);
    let check = keys.every(e => theAllowd.includes(e))
    let id = req.params.id
    try {
        if (!check) {
            return res.status(400).send({ "error": "Input Error" })
        }
        let prodect = await Prodect.findById(id)
        keys.forEach(e => {
            prodect[e] = req.body[e]
        })
        await prodect.save()
        res.send({ done: true })
    } catch (error) {
        res.status(400).send(error)
    }
})
// تحديث الصور
router.post('/pordect/pic/:id', authProdect, pics.fields([{ name: "pics" }]), async (req, res) => {
    let id = req.params.id
    try {
        if (!req.files.pics) {
            return res.status(401).send({ "error": "there is no pics has ben upload" })
        }
        let prodect = await Prodect.findById(id)
        prodect.pics_url = []
        prodect.pics = []

        for (i = 0; i < req.files.pics.length; i++) {
            let pic = await sharp(req.files.pics[i].buffer).png().toBuffer();
            prodect.pics = prodect.pics.concat({ "pic": pic })
            prodect.pics_url = prodect.pics_url.concat({ "pic": ("http://localhost:3000/prodect/" + prodect._id + "?i=" + i) })
        }

        await prodect.save()
        res.send(prodect)
    } catch (error) {
        res.status(400).send(error)
    }
})
// جلب المنتجات الي عليها تخفيض
router.get('/precdects/discount', async (req, res) => {
    try {
        let prodects = await Prodect.find({ 'old_prics': { $gte: 1 } })
        res.send(prodects)
    } catch (error) {
        res.status(400).send(error)
    }
})
// اضافة تخفيض علئ منتج
router.post('/precdects/discount/add', authAdmin, async (req, res) => {
    try {

        let prodect = await Prodect.findOne({ _id: req.body.prodect });

        if (!prodect) {
            return res.status(404).send({ "error": "Not found" })
        }

        prodect.old_prics = prodect.prics;
        prodect.prics = req.body.prics;
        prodect.prics_discount_percent = Math.trunc((100 - ((prodect.prics / prodect.old_prics) * 100)));

        await prodect.save()
        res.send({ "done": true })
    } catch (error) {
        res.status(400).send(error)
    }
})
// حذف التخفيض من المنتج
router.delete('/precdects/discount/remove', authAdmin, async (req, res) => {
    try {
        let prodect = await Prodect.findOne({ _id: req.body.prodect });
        if (!prodect) {
            return res.status(404).send({ "error": "Not found" })
        }
        if (prodect.old_prics == 0) {
            return res.status(400).send({ "error": "there is no discount" })
        }
        if (req.body.prics) {
            prodect.prics = req.body.prics

        } else {
            prodect.prics = prodect.old_prics

        }
        prodect.old_prics = 0
        prodect.prics_discount_percent = 0

        await prodect.save()
        res.send({ 'done': true })
    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router