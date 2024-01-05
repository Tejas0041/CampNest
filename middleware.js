const mongoose= require('mongoose');
const ExpressError= require('./utilities/ExpressError.js');
const Campground= require('./models/campground.js');
const Review= require('./models/review.js');

const {reviewSchema, campgroundSchema}= require('./schemas.js'); //JOI Schema

module.exports.isLoggedIn= (req, res, next)=>{
    if(!req.isAuthenticated())
      {
        req.session.returnTo= req.originalUrl;
        req.flash('error', 'You must be logged In!');
        return res.redirect('/login');
      }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.validateCampground = (req, res, next)=>{

    const {error}= campgroundSchema.validate(req.body);
    if(error)
    {
        const msg= error.details.map(el =>el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
    {
        next();
    }
}

module.exports.isAuthor= async(req, res, next)=>{
    const {id}= req.params;
    const campground= await Campground.findById(id);
    if(!(campground.author.equals(req.user._id)))
    {
        req.flash('error', 'You not authorized for that');
        return res.redirect(`/campground/${id}`);
    }
    next();
}

module.exports.isReviewAuthor= async(req, res, next)=>{
    const {id, reviewID}= req.params;
    const review= await Review.findById(reviewID);
    if(!(review.author.equals(req.user._id)))
    {
        req.flash('error', 'You not authorized for that');
        return res.redirect(`/campground/${id}`);
    }
    next();
}

module.exports.isAdmin= async(req, res, next)=>{
    if(!('tejas'===(req.user.username)))
    {
        req.flash('error', 'You not authorized for that');
        return res.redirect(`/campground/map`);
    }
    next();
}

module.exports.validateReview=(req, res, next)=>{
    const {error}= reviewSchema.validate(req.body);
    if(error)
    {
        const msg= error.details.map(el =>el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else
    {
        next();
    }
}
