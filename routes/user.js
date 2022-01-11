const router = require('express').Router();

const {
  editUserData,
  getCurrentUser,
  // logout,
} = require('../controllers/user');

const { validateUser } = require('../middlewares/validate');

router.get('/users/me', getCurrentUser);
router.patch('/users/me', validateUser, editUserData);
// router.get('/signout', logout);

module.exports = router;
