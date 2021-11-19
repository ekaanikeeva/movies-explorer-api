require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { login, createUser } = require('./controllers/user');
const auth = require('./middlewares/auth');
const userRouter = require('./routes/user');
const movieRouter = require('./routes/movie');

const { validateSignIn, validateSignUp } = require('./middlewares/validate');
const NotFoundError = require('./errors/NotFoundError');

const { PORT = 3000 } = process.env;
const app = express();

app.use(cors());

app.use(cookieParser());
app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.send(
    `<html><body>
    <p>Ответ на сигнал из далёкого космоса</p>
    </body>
    </html>`,
  );
});

app.post('/signup', validateSignUp, createUser);
app.post('/signin', validateSignIn, login);

app.use(auth);
app.use(userRouter);
app.use(movieRouter);

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

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
});

app.listen(PORT);
