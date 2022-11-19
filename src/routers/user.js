let express = require('express')
let routar = new express.Router();
let Prodect = require('../db/module/prodects')
let User = require('../db/module/users')
let multer = require('multer')
let auth = require('../auth/auth')
let sharp = require('sharp')
let Favorite = require('../db/module/favorite')
let authPassword = require('../auth/authPassword')
let authAdmin = require('../auth/authAdmin');

// تسجيل جديد
routar.post('/user/logup', async function (req, res) {
    let theAlloawd = ["email", "password", "name", "age"]
    let theKeys = Object.keys(req.body)
    let check = theKeys.every(e => theAlloawd.includes(e))

    if (!check) {
        res.status(400).send({ "error": "inputs uncrouct" })
    }
    try {
        let user = new User(req.body);
        let token = await user.genJwt();
        await new Favorite({ idUser: user.id }).save()
        res.send({ user, token })

    } catch (error) {
        res.status(400).send({ "error": error.message })
    }
}, (error, req, res, next) => {
    res.status(400).send({ "error": error.message })
})

//  تسجيل الدخول
routar.get('/user/login', async function (req, res) {


    try {
        let user = await User.checklog(req.body.email, req.body.password)
        let token = await user.genJwt();
        res.send({ user, token })
    } catch (error) {
        res.status(400).send({ "error": error.message })
    }


}, (error, req, res, next) => {
    res.status(400).send({ "error": error.message })
})

// عرض معلومات المستخدم
routar.get('/user/me', auth, async function (req, res) {
    res.send(req.user)
})

//  تسجيل الخروج
routar.post('/user/logout', auth, async function (req, res) {

    try {

        req.user.tokens = await req.user.tokens.filter(e => e.token !== req.token)

        await req.user.save();
        res.send({ "done": true })
    } catch (error) {
        res.status(400).send({ "done": false })
    }

})
//  تحديث المعلومات اليوزر
routar.patch('/user/updata', auth, async function (req, res) {
    let theAlloawd = ["email", "name", "age"]
    let theKeys = Object.keys(req.body)
    let check = theKeys.every(e => theAlloawd.includes(e))

    if (!check) {
        res.status(400).send({ "error": "inputs uncrouct" })
    }
    try {
        theKeys.forEach(e => {
            req.user[e] = req.body[e]
        })
        await req.user.save()
        res.status(200).send({ "update": true })
    } catch {
        res.status(400).send({ "update": false })
    }
})
// رفع صوره 
let pic = multer({
    limits: {
        fileSize: 5000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpeg|jpg)$/)) {
            return cb(new Error('Should be (PNG , JPG or JPEG)'))
        }

        cb(undefined, true)
    }
})
//  رفع صوره
routar.post('/user/avatar', auth, pic.single('pic'), async (req, res) => {

    try {
        let buffer = await sharp(req.file.buffer).png().toBuffer();
        req.user.avatar_url = "http://localhost:3000/user/" + req.user.id + "/avatar"
        req.user.avatar = buffer;
        await req.user.save()
        res.send({ "done": true })
    } catch (error) {
        res.status(400).send(error)
    }
}, (error, req, res, next) => {
    res.status(400).send({ "error": error.message })
})

// جلب صورة المستحدم
routar.get('/user/:id/avatar', async (req, res) => {
    try {
        let id = req.params.id
        let user = await User.findOne({ _id: id })
        res.set('content-type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(400).send(error)
    }
})
// حذف صورة المستخدم
routar.delete('/user/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save()
        res.send('done')
    } catch (error) {
        res.status(400).send(error)
    }
})

// نسيت الرمز
routar.get('/user/FP', async (req, res) => {
    let theAlloawd = ['email']
    let theKeys = Object.keys(req.body);
    let check = theKeys.every(e => theAlloawd.includes(e))

    try {
        if (!check) {
            throw new Error("input Error")
        }
        let user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.status(404).send({ "error": 'There is no user' })
        }
        let token = await user.genJwtPf();

        res.send(token)
    } catch (error) {
        res.status(400).send(error)
    }
})
// تغير الرمز  من رابط
routar.post('/user/FP/:token', authPassword, async (req, res) => {
    try {

        req.user.password = req.body.password;

        await req.user.save()
        console.log(req.user.password)
        res.send({ "done": true })
    } catch (error) {
        res.status(400).send()
    }
})
// تغير الرمز بعد التجسيل
routar.post('/user/changePassWord', auth, async (req, res) => {
    try {
        await req.user.checkPassword(req.body.password)
        req.user.password = req.body.newPassword
        await req.user.save()
        res.send({ "done": true })

    } catch (error) {
        res.status(400).send({ "error": error })
    }
})
// رفع فرق 
routar.post('/admin/user', authAdmin, async (req, res) => {
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

// جلب اعضاء الفريق
routar.get('/admin/myteam', authAdmin, async (req, res) => {
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

module.exports = routar