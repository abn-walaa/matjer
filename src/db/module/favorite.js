let mongoose = require('mongoose');

let favertPordctSac = new mongoose.Schema({
    prodect: [{
        idProdect: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'prodects',
        }
    }],
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users',
        unique: true,
    }
})

let favoProdect = mongoose.model('favorite', favertPordctSac)

module.exports = favoProdect;