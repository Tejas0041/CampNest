const Campground= require('../models/campground.js');
const {cloudinary}= require('../cloudinary/index.js');


const mbxGeocoding= require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken= process.env.MAPBOX_TOKEN;
const geocoder= mbxGeocoding({accessToken: mapBoxToken});

module.exports.homePage= async(req,res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/index.ejs', {campgrounds}); //index.ejs is in 'campgrounds' directory inside 'views' directory.
}

module.exports.newCampgroundForm= (req,res)=>{
    res.render('campgrounds/new.ejs');
}

module.exports.createCampground = async(req, res, next)=>{

    const geoData= await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();


    const camp= new Campground(req.body.campground); //since our data is in campground array, that's why we have to do .campground;
    camp.geometry= geoData.body.features[0].geometry; //this is in GeoJSON format

    camp.images =req.files.map(f=>({url: f.path, filename: f.filename}));
    camp.author= req.user._id;
    await camp.save();

    req.flash('success', 'Successfully created a new Campground');
    res.redirect(`/campground/${camp._id}`);
}

module.exports.editCampgroundForm= async(req,res)=>
{
    const campground= await Campground.findById(req.params.id);

    if(!campground)
    {
        req.flash('error', 'Cannot find that Campground');
        return res.redirect('/campground'); //if we don't add return here, then 'campgrounds/show.ejs' will get rendered
    }
    res.render('campgrounds/edit.ejs', {campground, deleteImgArr: 0});
}

module.exports.showCampground= async(req,res)=>{
    const campground= await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate:{
            path: 'author'
        }
    }).populate('author');

    if(!campground)
    {
        req.flash('error', 'Cannot find that Campground');
        return res.redirect('/campground'); //if we don't add return here, then 'campgrounds/show.ejs' will get rendered
    }
    res.render('campgrounds/show.ejs', {campground});
}

module.exports.deleteCampground= async(req, res)=>{
    const {id}= req.params;
    await Campground.findByIdAndDelete(id);

    req.flash('success', 'Successfully deleted your Campground');
    res.redirect('/campground/map');
}

module.exports.renderDeleteImages= async(req, res)=>{
    const {id}= req.params;
    const campground= await Campground.findById(id);

    return res.render('campgrounds/delete.ejs', {campground});
}

module.exports.postDeleteImages= async(req, res)=>{
    const {id}= req.params;
    const campground= await Campground.findById(id);
    const deleteImgArr= req.body.deleteImages;
    req.session.deleteImgNames= deleteImgArr;
    return res.render('campgrounds/edit.ejs',{campground, deleteImgArr});
}

module.exports.updateCampground= async(req, res)=>{
    const {id}= req.params;

    const campground= await Campground.findByIdAndUpdate(id, {...req.body.campground});
    //the spread operator(...) will spread the array and it will look like (id, {title: 'jbjhk', location: 'zkgxkvhlj'});

    const geoData= await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    campground.geometry= geoData.body.features[0].geometry; //this is in GeoJSON format


    const imgs= req.files.map(f=>({url: f.path, filename: f.filename}));
    //this will return an array, so we can't directly push it into campground.images, since it is of the type of array of objectId, but if we directly upload without spreading, that will become array of arrays, which will cause validation error in mongoose

    campground.images.push(...imgs);

    await campground.save();

    var delImg=0; //just for ensuring that upload img also work fine, since if we don't set it to 0, the there will be an error.. saying delImg is not defined

    if(req.session.deleteImgNames){
       delImg= req.session.deleteImgNames; //filenames of the images that has to be deleted (selected by the Author)
    }
    if(delImg!==0)
    {
        for(let fName of delImg){
            await cloudinary.uploader.destroy(fName);
        }

        await campground.updateOne({$pull: {images: {filename:{$in : delImg}}}});
    }

    req.flash('success', 'Successfully updated your Campground');
    res.redirect(`/campground/${campground._id}`);
}

module.exports.map= async(req, res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/map.ejs', {campgrounds});
}

