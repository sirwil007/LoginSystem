const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const app = express();
const dotenv = require("dotenv")
const bcrypt = require('bcrypt')
const User = require('./models/User.js')
    // const jwt = require("jsonwebtoken")
const passport = require('passport')
const initializePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')


initializePassport(passport, User);



dotenv.config({ path: '.env' })

const connectDb = require("./database/database.js")

connectDb();


app.use(expressLayouts);
app.set('view engine', '.ejs')
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

app.get("/", checkAuthenticated, (req, res) => {
    console.log(req.user)
    res.render("Home", { name: req.user.name })
})

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("Login")
})


app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("Register")
})


app.post("/login", checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// app.post("/login", async(req, res) => {
//     let em = req.body.email
//     let pass = req.body.password

//     let user = await User.findOne({ email: em })

//     if (user) {
//         bcrypt.compare(pass, user.password, (err, result) => {
//             if (err) {
//                 res.redirect("/login")
//             }
//             if (result) {
//                 let token = jwt.sign({ name: user.name }, 'verySecretValue', { expiresIn: '1h' })
//                 res.redirect("/")
//             }
//         })
//     } else {
//         res.redirect("/login")
//     }

// })

app.post("/register", checkNotAuthenticated, async(req, res) => {

    try {
        let hashedPass = await bcrypt.hash(req.body.password, 10)

        let user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPass
        })
        user.save().then(user => res.redirect("/login"))
    } catch {
        res.redirect("/register")
    }

})

app.delete("/logout", (req, res) => {
    req.logOut()
    res.redirect("/login")
})


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/login')
    }
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/")
    } else {
        return next()
    }
}

app.listen(3001, () => console.log("listening at port 3001"))