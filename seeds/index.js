const mongoose = require('mongoose');

const cities = require('./cities');
const {places, descriptors}= require('./seedHelpers.js');
const Campground= require('../models/campground.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true});

const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", ()=>{
    console.log("Database Connected");
});

const sample= (arr)=> arr[Math.floor(Math.random()* arr.length)]; //function for getting a random sample from an array;

const seedDB= async()=>{
    await Campground.deleteMany({}); //before seeding the DB, we will first ensure that it is empty.
    for(let i=0; i<350; i++)
    {
        const random1000= Math.floor(Math.random()*1000);
        const cost= Math.floor(Math.random()*2000)+2500;

        const camp= new Campground(
            {
                author: '65869c99a5db86bc05d7b34c',
                location: `${cities[random1000].city}, ${cities[random1000].state}`,
                title: `${sample(descriptors)} ${sample(places)}`,
                images: [
                    {
                      url: 'https://res.cloudinary.com/dxo8tirbk/image/upload/v1704038309/YelpCamp/wf4veadzwvcwxewe9bo2.jpg',
                      filename: 'YelpCamp/wf4veadzwvcwxewe9bo2',
                    },
                    {
                      url: 'https://res.cloudinary.com/dxo8tirbk/image/upload/v1704038310/YelpCamp/ozv2shuonrpp5tud2ozo.jpg',
                      filename: 'YelpCamp/ozv2shuonrpp5tud2ozo',
                    },
                    {
                      url: 'https://res.cloudinary.com/dxo8tirbk/image/upload/v1704192704/YelpCamp/t3epppqcb7btv6mbfhqn.jpg',
                      filename: 'YelpCamp/lf8mnrblihwjn8z86itr',
                    },
                    {
                      url: 'https://res.cloudinary.com/dxo8tirbk/image/upload/v1704192704/YelpCamp/m6rode8der2tq1usyilv.webp',
                      filename: 'YelpCamp/m6rode8der2tq1usyilv',
                    },
                    {
                      url: 'https://res.cloudinary.com/dxo8tirbk/image/upload/v1704135113/YelpCamp/thapaq2j8csaj56htxq6.avif',
                      filename: 'YelpCamp/thapaq2j8csaj56htxq6',
                    },
                  ],
                geometry: {
                  type: "Point",
                  coordinates: [
                    cities[random1000].longitude, //for GeoJSON, lng is before lat
                    cities[random1000].latitude,
                  ]
                },
                description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis laudantium quod vitae culpa! Nihil ipsa, odio libero eligendi exercitationem maxime dolorum rem, culpa doloribus perspiciatis corporis, veritatis tenetur? Inventore placeat illum provident repudiandae ex doloribus nesciunt ratione quos in porro?',
                price: cost
            }
            );

        await camp.save();
    }
}

//After our data is seeded.. we don't want this connection to be open anymore.. so when seedDB() will execute, a callback will run and it will close the connections;
seedDB().then(()=>{
    mongoose.connection.close();
});
