const {check} = require('express-validator');
const registerationValidation = [
    check('name','name is required').not().isEmpty(),
    check('email','Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:false
    }),
    check('password','Password is required').not().isEmpty(),
]

const loginValidation = [
    check('email','Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:false
    }),
    check('password','Password is required').not().isEmpty(),
]

module.exports = {registerationValidation,loginValidation};