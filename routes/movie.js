const router = require('express').Router();

const {
  createMovie,
  deleteMovie,
  getMovies,
} = require('../controllers/movie');

const { validateId, validateMovie } = require('../middlewares/validate');

router.post('/movies', validateMovie, createMovie);
router.delete('/movies/:_id', validateId, deleteMovie);
router.get('/movies', getMovies);

module.exports = router;
