const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const Review= require('./review.js');
const { required } = require('joi');

const ImageSchema= new Schema({
    url: String,
    filename: String,
});
//making image thumbnail of width 500px by using w_500 (read cloudinary docs for more info)
ImageSchema.virtual('thumbnail').get(function (){
    return this.url.replace('/upload', '/upload/w_550');
});


//by default, mongoose does not include virtuals when you convert a document to JSON..to include virtuals.. you have to perform the step below
const opts= {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
    title: String,
    images:[ImageSchema],
    geometry:{
        type:{
            type: String,
            enum: ['Point'], //'geometry.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkUp').get(function (){
    return `<h6><b><a href="/campground/${this._id}" style="text-decoration: none;">${this.title}</a></b></h6> <div>${this.location}</div>`;
});


/* This will delete all the comments related to that particular campground, if the campground os deleted */
CampgroundSchema.post('findOneAndDelete', async(doc)=>{
    if(doc)
    {
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
