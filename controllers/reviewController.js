const Campground= require('../models/campground.js');
const Review= require('../models/review.js');

module.exports.postReview= async(req, res)=>{
    const campground= await Campground.findById(req.params.id);
    const review= new Review(req.body.review);

    review.author= req.user._id;

    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash('success', 'Successfully added your Review');
    res.redirect(`/campground/${campground._id}`);
}

module.exports.deleteReview= async(req, res)=>{
    const {id, reviewID}= req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewID}}); /*pull removes the field matching id from the array for the reviesw property*/
    await Review.findByIdAndDelete(reviewID);

    req.flash('success', 'Successfully deleted your Review');
    res.redirect(`/campground/${id}`);
}