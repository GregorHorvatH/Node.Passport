var express = require('express');
var router = express.Router();

// Get homepage
router.get('/', ensureAuthenticated, function(req, res) {
  res.render('index');
});

// Get about page
router.get('/about', ensureAuthenticated, function(req, res) {
  res.render('about');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    // req.flash('error_msg', 'You are not logged in');
    res.redirect('/users/login');
  }
}

module.exports = router;