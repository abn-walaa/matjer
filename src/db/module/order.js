let mongoose = require('mongoose');
let validator = require('validator')
let orderSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    prodects: [{
        prodect: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'prodects'
        },
        whoMany: {
            type: Number,
            default: 1,
            min: 1
        },

    }],
    discont: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'discounts'
    },
    adress: {
        type: String,
        require: true
    },
    phoneNumber: {
        type: String,
        validator(a) {
            if (!validator.isMobilePhone(a, "ar-IQ")) {
                throw new Error('The phone Number is wrong')
            }
        }
    },
    prics: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "on-hold"
    }
})


let order = mongoose.model('orders', orderSchema)

module.exports = order