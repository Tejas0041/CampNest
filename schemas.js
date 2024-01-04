const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//from the docs
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension); //our old version of joi is now extended with html sanitization


//if we submit an HTML code in title of our campground or some script, then our app will breakup.. so we have to prevent the user to do that

//since, joi do not comes with its own validator.. we are writing it by our own

module.exports.campgroundSchema = Joi.object //not a mongoose Schema. This schema is used to validate the submitted data
    ({
        campground:Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
        }).required(),
        deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object //not a mongoose Schema. This schema is used to validate the submitted data
    ({
        review: Joi.object({
            rating: Joi.number().required().min(1).max(5),
            body: Joi.string().required().escapeHTML()
        }).required()
});
