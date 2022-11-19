let mongoose = require('mongoose');

let prodectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    disc: {
        type: String,

    },
    type: {
        type: String,
        default: "un-non"
    },
    prics: {
        type: Number,
        required: true
    },
    pics: [{
        pic: {
            type: Buffer
        }
    }],
    pics_url: [{
        pic: {
            type: String
        }
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    staticPublic: {
        type: String,
        default: "public"
    },
    old_prics: {
        type: Number,
        default: 0
    },
    prics_discount_percent: {
        type: Number
    }

}, {
    timestamps: true
})

prodectSchema.methods.toJSON = function () {
    let prodect = this

    prodect = prodect.toObject()

    delete prodect.owner.password
    delete prodect.owner.tokens

    delete prodect.pics

    return prodect
}

let prodect = mongoose.model('prodects', prodectSchema)

module.exports = prodect