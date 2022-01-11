const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequest = require('../errors/BadRequest');
const ConflictingRequest = require('../errors/ConflictingRequest');

const { NODE_ENV, JWT_SECRET } = process.env;

// создает пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then(() => {
      res.status(200).send({
        name, email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest({ message: 'Переданы некорректные данные при создании пользователя' }));
      } else if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictingRequest({ message: 'Этот email уже зарегистрирован' }));
      }
    });
};

// проверяет переданные в теле почту и пароль, возвращает JWT
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'oneStrongSecret25', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ token });
    })
    .catch(next);
};

module.exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
  return res.sendStatus(200);
};
