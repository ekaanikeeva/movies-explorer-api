const router = require('express').Router();

const { validateSignIn, validateSignUp } = require('../middlewares/validate');
const { login, createUser, logout } = require('../controllers/auth');
const auth = require('../middlewares/auth');
const userRouter = require('./user');
const movieRouter = require('./movie');

router.post('/signup', validateSignUp, createUser);
router.post('/signin', validateSignIn, login);
router.get('/signout', logout);

router.use(auth);
router.use(userRouter);
router.use(movieRouter);

module.exports = router;
