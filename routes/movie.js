const router = require('express').Router();

const {
  createMovie,
  deleteMovie,
} = require('../controllers/movie');

const { validateId, validateMovie } = require('../middlewares/validate');

router.post('/movies', validateMovie, createMovie);
router.delete('/movies/:_id', validateId, deleteMovie);

module.exports = router;
