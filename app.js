const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Global Middlewares
//console.log(process.env.NODE_ENV);

//Set security HTTP headers
app.use(helmet()); //устанавливает заголовки Headers, должен быть первым мидлваром

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //3rd party мидлвар который возвращает функцию логгер в консоль где видно http метод,
  // путь (route), статус код и время в мс
}

//ограничивание кол-ва запросов с 1 айпи
const limiter = rateLimit({
  max: 1, // Максимум 100 запросов с одного айпи
  windowMs: 60 * 60 * 1000, // 1 час
  message: 'Too many requsets from this IP, please try again in an hour'
});
app.use('/api', limiter);

//Body parser,reading data body into req.body
app.use(express.json({ limit: '10kb' })); // мидл вар который обрабатывает наш запрос (req)

//Serving static files
app.use(express.static(`${__dirname}/public`)); // 66 урок как смотреть статик файлы

/* app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
}); */

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
  // к поступающему запросу в этом мидлваре мы как бы добавили св-во requestTime
  // которое вызываем в методе getAllTours
});

// app.get('/api/v1/tours', getAllTours)

// app.get('/api/v1/tours/:id', getTour)

// app.post('/api/v1/tours', createTour)

// app.patch('/api/v1/tours/:id', updateTour)

// app.delete('/api/v1/tours/:id', deleteTour)

// 3)Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
}); // Мидлвар для не существующих url

app.use(globalErrorHandler);

module.exports = app;
