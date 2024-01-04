const express= require('express');
const router= express.Router({mergeParams: true}); //we cant access parameter ':id' here sice router separates that parameter, so to access it.. we have to merge parameter//
const catchAsync= require('../utilities/catchAsync.js');
const Review= require('../models/review.js');
const Campground= require('../models/campground.js');
const reviewController= require('../controllers/reviewController.js');

const {isReviewAuthor, isLoggedIn, validateReview}= require('../middleware.js');

router.post('/', validateReview, isLoggedIn, catchAsync(reviewController.postReview));

router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports= router;