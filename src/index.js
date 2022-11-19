let express = require('express');
//  تفعيل اتصال مع الداتا بيس
require('./db/db')
// الموديل الخاص باليوزرز
let User = require('./db/module/users')
// روتر الخاص باليوزر
let userRouter = require('./routers/user')
//  روتر خاص بالمنتجات
let prodectRouter = require('./routers/prodect')
// روتر خاص بالادمن
let adminRouter = require('./routers/admin')
// روتر الخاص بالمفضله
let favorite = require('./routers/favorite')
// الروتر الخاص بالطلبات
let order = require('./routers/order')
// الروتر الخاص بالخصومات
let discount = require('./routers/discont')
let t = require('multer')
let app = express();
app.use(express.json());
app.use(userRouter)
app.use(prodectRouter)
app.use(adminRouter)
app.use(favorite)
app.use(order)
app.use(discount)
app.get('*', (req, res) => {

    res.send(`
    <h1>404</h1>
    `)
})
app.listen(3000, () => {

    console.log('server is up')
});

