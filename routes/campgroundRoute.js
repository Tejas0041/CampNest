const express=require('express');
const router= express.Router();
const catchAsync= require('../utilities/catchAsync.js');
const campController= require('../controllers/campgroundController.js');
const multer= require('multer');
const {storage} = require('../cloudinary/index.js');
const upload= multer({storage});

const {isLoggedIn}= require('../middleware.js');

const {isAuthor, validateCampground, isAdmin}= require('../middleware.js');

//using controller.. by using this we can shorten our routes.
router.get('/', catchAsync(campController.homePage));

//creating new campgrounds
//router.route is used to group rouetes with same verbs

router.route('/map')
      .get(catchAsync(campController.map));

router.route('/new')
      .get(isLoggedIn, isAdmin, campController.newCampgroundForm)
      .post(isLoggedIn, isAdmin, upload.array('image'), validateCampground, catchAsync(campController.createCampground));


router.route('/:id/images/delete')
      .get(isLoggedIn, isAuthor, catchAsync(campController.renderDeleteImages))
      .post(isLoggedIn, isAuthor, catchAsync(campController.postDeleteImages));

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campController.editCampgroundForm));

router.route('/:id')
      .get(catchAsync(campController.showCampground))
      .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campController.updateCampground))
      .delete(isLoggedIn, catchAsync(campController.deleteCampground));

module.exports= router;
