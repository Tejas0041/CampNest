if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express= require('express');
const app= express();
const mongoose= require('mongoose');
const ejsMate= require('ejs-mate');
const path=require('path');
const session= require('express-session');
const flash= require('connect-flash');
const ExpressError= require('./utilities/ExpressError.js');
const passport= require('passport');
const LocalStrategy= require('passport-local');
const User= require('./models/user.js');
const MongoDBStore= require("connect-mongo");
// const dbUrl= 'mongodb://127.0.0.1/yelp-camp';
const dbUrl= process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

const secret= process.env.SECRET || 'thisshouldbeabettersecret';

const mongoSanitize= require('express-mongo-sanitize');//this will remove $ or . from req.query and req.param to protect our app from mongo injection[$gt='']

const helmet= require('helmet');

const methodOverride= require('method-override');
// const Joi = require('joi'); //not required, since we are exporting the Joi Schema

const campgroundRoutes= require('./routes/campgroundRoute.js');
const reviewRoutes= require('./routes/reviewsRoute.js');
const userRoutes= require('./routes/authenticationRoute.js');

/********MONGO CONNECTION**********/

// mongoose.connect(dbUrl);
//allowed access from all ip address
mongoose.connect(dbUrl);

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", ()=>{
    console.log("Database Connected");
});

/****************/

app.engine('ejs', ejsMate); //using ejs-mate

app.use(express.urlencoded({extended: true})); //for parsing the request body;

app.use(methodOverride('_method'));

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));  //setting up the public directory to serve static files
app.set('view engine', 'ejs');

app.use(mongoSanitize());

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*60*60 //time is in seconds
});

store.on('error', function(err){
    console.log("Error!", err);
})

const sessionConfig= {
    store, //using mongo to save our session
    name: 'yelpcamp',
    httpOnly: true, //this will protect our cookie to be accessed using JS code.. it can only be accessed through http//
    // secure: true, //our cookie can be changed only over https(s stands for secure)
    secret,
    resave: false,           //just for removing deprecation warnings
    saveUninitialized: true, //just for removing deprecation warnings
    cookie: {
        expires: Date.now() + (1000*60*60*24*7), //date is in milliseconds, we have set expire date as 7 days from the current date
        maxAge: (1000*60*60*24*7)
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet()); //helps to secure our app by setting various HTTP headers.


//setting up ContentSecurituPolicy
//we provided some sources from where the data can be loaded
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
    "https://getbootstrap.com/docs/5.3/assets/css/docs.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dxo8tirbk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
                "https://icon-library.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize()); //this is used to initialize a passport
app.use(passport.session()); // used for persistent login sessions, if not used, user have to login at every page

passport.serializeUser(User.serializeUser()); //storing user data
passport.deserializeUser(User.deserializeUser()); //unStoring user data

passport.use(new LocalStrategy(User.authenticate())); //using the local password strategy to authentical User (our model)

app.use((req, res, next)=>{
    res.locals.currentUser= req.user;  //this will deserialize the information stored in session
    res.locals.success= req.flash('success');
    res.locals.error= req.flash('error');
    next();
});


/* campground routes */
app.use('/', userRoutes);
app.use('/campground', campgroundRoutes); //setting up '/campground route'
app.use('/campground/:id/reviews', reviewRoutes);

app.get('/', (req,res)=>{
    res.render('home.ejs');
});


//This will check error for all request and every path
app.all('*', (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404)); //this will hit out error handler
});

//error handler
app.use((err, req, res, next)=>{
    const {statusCode=500}= err;
    if(!err.message) err.message='Someting went Wrong !';
    res.status(statusCode).render('error.ejs', {err});
});

app.listen(8080, ()=>{
    console.log(`Server started successfully at port 8080`);
});