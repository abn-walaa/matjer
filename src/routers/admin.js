let express = require('express')
let router = new express.Router();
let User = require('../db/module/users')
let Prodect = require('../db/module/prodects')
let authAdmin = require('../auth/authAdmin');

// رفع فرق 
router.post('/admin/user', authAdmin, async (req, res) => {
    try {
        if (req.user.email === req.body.email) {
            throw new Error(`You can upload ur self`)
        }
        let member = await User.findOne({ "email": req.body.email })
        if (!member) {
            throw new Error('there is no member')
        }
        if (member.rol === "team") {
            throw new Error('is in the team')
        }

        member.rol = "team";
        await member.save()
        res.send({ "done": true })
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})
// حذف احد اعضاء الفريق
router.delete('/admin/re-user', authAdmin, async (req, res) => {

    try {
        let ok3 = req.query.ok || false


        let memberTeam = await User.findOne({ _id: req.body.id });
        if (!memberTeam) {
            throw new Error('There is no one ad this id')
        }
        if (memberTeam.rol !== "team") {
            throw new Error('is a member')
        }

        if (ok3 === "true") {
            console.log(ok3 === "true")
            memberTeam.rAllProdects()
        }
        memberTeam.rol = "custmer";

        await memberTeam.save()
        res.send({ "done": true })
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})
// جلب اعضاء الفريق
router.get('/admin/myteam', authAdmin, async (req, res) => {
    try {

        let teamMembers = await User.find({ "rol": "team" })
        if (!teamMembers) {
            throw new Error(`u dont have team`)
        }
        res.send(teamMembers)
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})
// جلب المنتجات غير الموقفه عليها 
router.get('/admin/prodects', authAdmin, async (req, res) => {
    try {
        let limit = req.query.l || 0;
        let skip = req.query.s || 0
        let prodects = await Prodect.find({ staticPublic: "on-hold" }).limit(limit).skip(skip)

        if (prodects.length === 0) {
            return res.send({ "error": "there is no prodects" })
        }
        res.send(prodects)
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
})
// تحديث البوست من و الئ
router.post('/admin/prodect/:id', authAdmin, async (req, res) => {
    try {
        let id = req.params.id
        let prodect = await Prodect.findById(id);

        if (prodect.staticPublic === "on-hold") {
            prodect.staticPublic = "public"
        } else {
            prodect.staticPublic = "on-hold"
        }
        await prodect.save();
        res.send({ "done": true })
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }

})
// 
module.exports = router