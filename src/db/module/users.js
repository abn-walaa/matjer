let mongoose = require('mongoose');
let validator = require('validator')
let jwt = require('jsonwebtoken');
let bcrypt = require('bcrypt');
const prodect = require('./prodects');
let UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,

    },
    age: {
        type: Number,
        required: true,
        min: [12, "child"],
        max: [99, "to old man "]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(v) {

            if (!validator.isEmail(v)) {
                throw new Error('is not Email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Should be 8 char or more"],
        validate(pass) {
            pass = pass.toLocaleLowerCase();
            if (pass.includes(this.email)) {
                throw new Error('Email in the passward')
            } else if (pass.includes('passward')) {
                throw new Error('Passward is in')
            }
        }
    },
    tokens: [{
        token: {
            type: String,

        }
    }],
    avatar: {
        type: Buffer,

    },
    avatar_url: {
        type: String,
        default: "https://i.pinimg.com/564x/d2/03/76/d20376a502431128bf28da32e4eb7812.jpg"
    }
    ,
    rol: {
        type: String,
        default: "custmer"
    },

}, {
    timestamps: true
})

// توليد توكن وخزن
UserSchema.methods.genJwt = async function () {
    let user = this
    let token = jwt.sign({ _id: user.id.toString() }, process.env.JWT);

    user.tokens = user.tokens.concat({ "token": token })

    await user.save()
    return token
}
// توليد توكن خاص لفقدان الرمز
UserSchema.methods.genJwtPf = async function () {
    let user = this

    let token = jwt.sign({ _id: user.id }, process.env.JWT, { expiresIn: '900000' })
    return token
}

// قبل التخزين تشفير الرمز اذا تم تغيره
UserSchema.pre('save', async function (next) {
    let user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})
// اخاف المعلومات
UserSchema.methods.toJSON = function () {
    let user = this
    user = user.toObject();
    delete user.password;
    delete user.tokens;
    delete user.avatar;
    return user
}

// تاكيد من المعلومات التسجيل
UserSchema.statics.checklog = async function (email, password) {
    let user = await User.findOne({ email })

    if (!user) {
        throw new Error('not found')
    }
    let check = await bcrypt.compare(password, user.password);
    if (!check) {
        throw new Error('password is wrong')
    }
    return user
}
// تاكد من الرمز 
UserSchema.methods.checkPassword = async function (oldPassword) {
    let user = this

    let check = await bcrypt.compare(oldPassword, user.password)
    console.log(check)
    if (check === true) {
        return true
    }
    throw new Error('Password is wrong');
}
// حذف جميع منشورات العضو بعد ازالته
UserSchema.methods.rAllProdects = async function () {
    let user = this

    await prodect.deleteMany({ owner: user._id })
    return true
}
let User = mongoose.model('users', UserSchema)

module.exports = User