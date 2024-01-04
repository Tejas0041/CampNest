const express= require('express');
const router= express.Router();
const catchAsync= require('../utilities/catchAsync.js');
const {storeReturnTo} =require('../middleware.js');
const reviewController= require('../controllers/authController.js');


const passport = require('passport');

router.route('/register')
      .get((req, res)=>{
        res.render('authentication/register.ejs')
       })
       .post(catchAsync(reviewController.submitReview))

router.route('/login')
      .get((req, res)=>{
        res.render('authentication/login.ejs');
       })
       .post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'})/*middleware provided by passport to authenticate*/, reviewController.login);


router.get('/logout', reviewController.logout);

module.exports= router;
