const AppError = require('./../utils/appError');

// Здесь мы разделяем ошибки на этапе разработки и ошибки на этапе готового приложения
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name;
  const message = `Duplicate field value : ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  console.log(err);
  const errors = Object.values(err.errors).map(el => el.message); // перебериаем все объекты в errors и ищем все поля message и собираем их в массив
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

//Ошибки на этапе production мы разделяем на операционныеб которые мы знаем и предусмотрели в наших контроллерах и ошибки которые мы не ожидали
// Операционные : пользователь пытается пройти по ссылке которая не существует, неправильные тип данных и т.д

const sendErrorProd = (err, res) => {
  //Operational error: send mesage to client
  //console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    //Programming or other unknown errors: don't leak error details
  } else {
    //1) Log error
    console.error('Error: ', err);
    //console.log(process.env.NODE_ENV);

    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  // ERROR  handling мидлвар
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    //console.log(error.name);
    console.log(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidatorError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    sendErrorProd(error, res);
  }
};
