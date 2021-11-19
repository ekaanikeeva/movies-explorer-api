const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/Unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;
module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'oneStrongSecret25');
  } catch (err) {
    throw new Unauthorized({ message: 'Необходима авторизация' });
  }
  req.user = payload;
  return next();
};
