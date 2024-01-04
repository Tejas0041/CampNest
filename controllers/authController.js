const User= require('../models/user.js');

module.exports.submitReview = async(req, res, next)=>{
    try{
        const {username, email, password}= req.body;
        const u = new User({username, email});
        const newUser= await User.register(u, password);

        //when a user registers(sign up), it must be loggedIn also, so we use the Helper method os passport called .login(requires a callback)
        req.login(newUser, (err)=>
        {
            if(err) return next(err);
            req.flash('success', 'Logged in Successfully');
            res.redirect('/campground/map');
        });
    }

    catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }

}

module.exports.login= (req, res)=>{
    req.flash('success', "Welcome back!");
    const redirectUrl= res.locals.returnTo || '/campground/map';
    delete req.session.returnTo;

    res.redirect(redirectUrl);
}

module.exports.logout= (req, res, next) => {               //req#logout requires a callback function
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', "Logged you out!");
        res.redirect('/campground/map');
    });
}
