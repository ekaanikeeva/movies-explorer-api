const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const IntervalServerError = require('../errors/Unauthorized');
const BadRequest = require('../errors/BadRequest');
const ConflictingRequest = require('../errors/ConflictingRequest');

const { NODE_ENV, JWT_SECRET } = process.env;

// возвращает информацию о пользователе
module.exports.getCurrentUser = (req, res, next) => {
  User.find(req.user)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NotFoundError({ message: 'Невалидный id' });
      } else {
        throw new IntervalServerError({ message: '500- Не удалось получить данные пользователей. Произошла ошибка' });
      }
    })
    .catch(next);
};

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
        throw new BadRequest({ message: 'Переданы некорректные данные при создании пользователя' });
      } else if (err.name === 'MongoServerError' && err.code === 11000) {
        throw new ConflictingRequest({ message: 'Этот email уже зарегистрирован' });
      } else throw new IntervalServerError({ message: '500- Не удалось получить данные пользователя. Произошла ошибка' });
    })
    .catch(next);
};

// обновляет информацию о пользователе
module.exports.editUserData = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new BadRequest({ message: 'Пользователь не найден' });
      } return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequest({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else {
        next(err);
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

// удаляет jwt из куков пользователя
module.exports.logout = async (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
};
