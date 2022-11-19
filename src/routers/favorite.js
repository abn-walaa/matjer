let express = require('express');
let router = new express.Router();
let Favorite = require('../db/module/favorite')
let auth = require('../auth/auth');


// اضافة الئ المفضله
router.post('/favorite/:id', auth, async (req, res) => {
    let id = req.params.id;
    try {
        let check = await Favorite.findOne({ "prodect.idProdect": id, idUser: req.user.id })

        if (check) {
            return res.send({ error: "has added" })
        }
        let favorite = await Favorite.findOne({ idUser: req.user.id })
        favorite.prodect = favorite.prodect.concat({ idProdect: id })
        await favorite.save()
        res.send({ done: true })
    } catch (error) {
        res.status(400).send(error)
    }
})
// عرض المفضله
router.get('/favorite', auth, async (req, res) => {
    try {
        const theFavorite = await Favorite.findOne({ idUser: req.user.id }).populate({ path: 'prodect.idProdect' }).exec();
        if (theFavorite.prodect.length === 0) {
            return res.send({ error: "empty" })
        }
        res.send(theFavorite)
    } catch (error) {
        res.status(400).send(error)
    }
})
// حذف من المفضله
router.delete('/favorite/del/:id', auth, async (req, res) => {
    try {
        let faviritProdect = await Favorite.findOne({ idUser: req.user.id, "prodect.idProdect": req.params.id });
        if (!faviritProdect) {
            return res.status(404).send();
        }

        faviritProdect.prodect = faviritProdect.prodect.filter(e => e.idProdect != mongoose.Types.ObjectId(req.params.id) ? '' : e.idProdect);
        console.log(faviritProdect)
        await faviritProdect.save()
        res.send({ done: true })
    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router