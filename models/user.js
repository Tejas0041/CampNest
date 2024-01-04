const mongoose= require('mongoose');
const Schema= mongoose.Schema;
const passportLocalMongoose= require('passport-local-mongoose');

const userSchema= new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
    //we will not add username and password here.. passportLocalMongoose plugin will take care of that
});

userSchema.plugin(passportLocalMongoose);  /* Schemas are pluggable, that is, they allow for applying pre-packaged capabilities to extend their functionality. This is a very powerful feature. */

module.exports= mongoose.model('User', userSchema);