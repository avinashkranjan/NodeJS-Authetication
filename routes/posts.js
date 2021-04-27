const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
    res.json({
        posts: {
            title: 'My First Post',
            description: 'You should not access w/o Login'
        }
    });
});

module.exports = router;