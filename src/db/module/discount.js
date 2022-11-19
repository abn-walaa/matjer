let mongoose = require('mongoose')

let discountSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    dis: {
        type: Number,
        required: true
    }
})

let discount = mongoose.model('discounts', discountSchema)

module.exports = discount;