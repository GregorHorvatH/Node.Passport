var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', function (req, res) {
  res.render('register');
});

// Login
router.get('/login', function (req, res) {
  res.render('login');
});

// Logout
// router.get('/logout', function (req, res) {
//   res.render('logout');
// });


// Register USER
router.post('/register', function (req, res) {
  var { name, email, username, password, password2 } = req.body;

  // Validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords not match').equals(password);

  var errors = req.validationErrors();

  if (errors) {
    res.render('register', { errors });
  } else {
    var newUser = new User({
      name,
      email,
      username,
      password
    });

    User.createUser(newUser, function (err, user) {
      if (err) throw err;

      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/users/login');
  }
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      User.comparePassword(password, user.password, function (err, isMatch) {
        if (err) throw err;
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    });

    // User.findOne({ username: username }, function (err, user) {
    //   if (err) { return done(err); }
    //   if (!user) {
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   return done(null, user);
    // });
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function (req, res) {
    // If this function gets called, authentication was successful.
    res.redirect('/');
  });

router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});

module.exports = router;
