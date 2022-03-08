const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, User) {


    const authnticateuser = async(email, pass, done) => {
        let user = await User.findOne({ email: email })
        if (user) {
            try {
                if (await bcrypt.compare(pass, user.password)) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: "Password Incorrect" })
                }
            } catch (e) {
                return done(e)
            }

        } else {
            return done(user, false, { message: 'No user found' })
        }


    }
    passport.use(new LocalStrategy({ usernameField: 'email' },
        authnticateuser))

    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    })
}

module.exports = initialize;