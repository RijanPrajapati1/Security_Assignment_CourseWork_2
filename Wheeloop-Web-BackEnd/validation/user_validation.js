const joi = require("joi");

const userSchema = joi.object({
    full_name: joi.string().required(),
    email: joi.string().required().email(),
    address: joi.string().required(),
    phone_number: joi.string().required(),
    password: joi.string().required(),
    confirm_password: joi.string().required(),

})


function UserValidation(req, res, next) {
    const { full_name, email, address, phone_number, password, confirm_password } = req.body;
    const { error } = userSchema.validate({ full_name, email, address, phone_number, password, confirm_password })
    if (error) {
        return res.json(error)
    }
    next()
}


module.exports = UserValidation;