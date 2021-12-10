require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { DB_DEV, mongooseSettings } = require('./utils/constants');

const router = require('./routes/index');

const NotFoundError = require('./errors/NotFoundError');

const { DATABASE, NODE_ENV } = process.env;

const { PORT = 3000 } = process.env;
const app = express();

app.use(cors({
  credentials: true,
  origin: [
    'https://movies-search.nomoredomains.rocks/',
    'http://movies-search.nomoredomains.rocks/',
    'https://api.movies-search.nomoredomains.rocks',
    'http://api.movies-search.nomoredomains.rocks',
    'http://localhost:3000',
  ],
}));

app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

app.use(router);

app.use(() => {
  throw new NotFoundError({ message: '404- Ресурс не найден' });
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

mongoose.connect(NODE_ENV === 'production' ? DATABASE : DB_DEV, mongooseSettings);

app.listen(PORT);
