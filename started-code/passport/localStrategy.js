const User = require("../models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

passport.use('local-login', new LocalStrategy((username, password, next) => {
  User.findOne({
    email:username
  }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, {
        message: "Incorrect email"
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
    
      
      return next(null, false, {
        message: "Incorrect password"
      });
    }
    
    return next(null, user);
  });
}));

//passport hash

passport.use('local-signup', new LocalStrategy({
  passReqToCallback: true
},
(req, username, password, next) => {
  // To avoid race conditions
  process.nextTick(() => {
    User.findOne({
      'username': username
    }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (user) {
        return next(null, false);
      } else {
        // Destructure the body
        const {
          username,
          email,
          password
        } = req.body;
        
        const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
        const newUser = new User({
          username,
          email,
          password: hashPass,
        });
        
        newUser.save((err) => {
          if (err) {
            next(null, false, {
              message: newUser.errors
            })
          }
          return next(null, newUser);
        });
      }
    });
  });
}));