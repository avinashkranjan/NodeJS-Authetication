const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../validation');

// REGISTER
router.post('/register', async (req, res) => {
    // Validating Data
    const {error} = registerValidation(req.body)
    if(error) return res.status(404).send(error.details[0].message);

    
    //Checking if the user is already in the database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(404).send('Email already Exist');   
    
    //Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    //Create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });
    try {
        const savedUser = await user.save();
        res.send({user: user.id});
    } catch (err) {
        res.status(404).send(err);
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    // Validating Data
    const {error} = loginValidation(req.body)
    if(error) return res.status(404).send(error.details[0].message);

    //Checking if the user is already in the database
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(404).send('Email does not Exist');   

    //Password is Correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send('Invalid Password');

    //Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);     
    
    // res.send('Logged In');
});

module.exports = router;