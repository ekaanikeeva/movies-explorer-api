const User = require('../models/user');

const ConflictingRequest = require('../errors/ConflictingRequest');
const BadRequest = require('../errors/BadRequest');

// возвращает информацию о пользователе
module.exports.getCurrentUser = (req, res, next) => {
  User.find(req.user)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      next(err);
    });
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
        next(new BadRequest({ message: 'Пользователь не найден' }));
      } return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequest({ message: 'Переданы некорректные данные при обновлении профиля' }));
      } else if (err.name === 'MongoServerError' && err.code === 11000) {
        next(new ConflictingRequest({ message: 'Этот email уже зарегистрирован' }));
      }
    });
};

// удаляет jwt из куков пользователя
module.exports.logout = async (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
};
