let express = require('express');
//  تفعيل اتصال مع الداتا بيس
require('./db/db')
// الموديل الخاص باليوزرز
let User = require('./db/module/users')
// تعامل مع الكوكيز
let cookiePares = require('cookie-parser')

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
//hbs
let jwt = require('jsonwebtoken')
let hbs = require('hbs')
let path = require('path')
let app = express();
app.use(cookiePares());
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
// set the web view
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../pulbic/html'))
hbs.registerPartials(path.join(__dirname, '../pulbic/parites'))


app.use(userRouter)
app.use(prodectRouter)
app.use(adminRouter)
app.use(favorite)
app.use(order)
app.use(discount)
app.use(express.static(path.join(__dirname, '../pulbic')))


app.get('/log', (req, res) => {
    if (req.cookies.token) {
        return res.render("main")
    }
    res.cookie("token", jwt.sign('hello', 'he'), { httpOnly: true })
    return res.render("login")
})
app.get('/', (req, res) => {
    res.clearCookie("token")
    res.send();
})

app.get('*', (req, res) => {

    res.send(`
    <h1>404</h1>
    `)
})
console.log(process.env.DBCONNECT)
app.listen(3000, () => {

    console.log('server is up')
});

