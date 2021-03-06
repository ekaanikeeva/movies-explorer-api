const Movie = require('../models/movie');

const NotFoundError = require('../errors/NotFoundError');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

// добавляет фильм пользователя
module.exports.createMovie = (req, res, next) => {
  const creatorId = req.user._id;
  const {
    country, director, duration, year, description,
    image, trailer, thumbnail, movieId, nameRU, nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: creatorId,
  })
    .then((film) => res.send(film))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest({ message: 'Ошибка валидации' }));
      }
    });
};

// удаляет фильм пользователя
module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((film) => {
      if (!film) {
        next(new NotFoundError({ message: 'Фильм не найден' }));
      }
      if (film.owner.toString() !== req.user._id) {
        next(new Forbidden({ message: 'Недостаточно прав для удаления этого фильма!' }));
      }
      Movie.findByIdAndRemove(req.params._id)
        .then((userFilm) => res.send(userFilm))
        .catch(next);
    });
};

// получить все фильмы
module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((films) => res.send(films))
    .catch(next);
};
