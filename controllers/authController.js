const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendMail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({req.body}); // такая запись неправильная т.к берет и записывает данные из пост запроса из body.
  //Это дает возможность создать пользователя с правами администратора, ниже запись правильная
  // все самописные поля из запросы не будут записаны в бд
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetExpires: req.body.passwordResetExpires
  }); // возвращает промис

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Проверяем существую ли такая пара почты и пароля
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  // Проверяем существует ли пользователь и пароль верный
  const user = await User.findOne({ email }).select('+password');
  //console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // Если все норм то отсылаем токен на клиент
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Получить токен и проверить есть ли он
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //console.log(token);
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }
  // 2) Провалидировать токен проверить его
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  // 3) Прооверить существует ли такой пользователь в бд
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('The user does no longer exists', 401));
  }
  // 4) Проверить менял ли пользователь пароль после того как ему был присвоен токен

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles - массив ['admin','guide', 'lead-guide'] role = "user"
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Получить пользователя с бд по почте которую он отправил
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //2) Сгенерировать новый токен для сброса пароля
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) Отправить на его почту
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}.\nIf you didn't forget your password, please ignore this email`;
  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Получить пользователя по токену
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex'); // токен параметр указанный в рауте /resetToken:token

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() } // сравниваем свойство resetExpires с текущей датой
  });

  // 2) Если токен валиден  (not expired) и такой пользователь есть, установить новый пароль

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password; // ставим новый пароль
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // не отключаем валидаторы модели т.к нужно провалидировать пароли
  // 3) Обноваить changedPasswordAt свойство в бд

  // 4) Залогинить пользователя, отправить JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Получить пользователя с бд
  const user = await User.findById(req.user.id).select('+password');
  // 2) Проверить отправленный пароль правильный ли он
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  // 3) Если все ок, то обновить его

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate WILL NOT work as intended!!!
  //4) Залогинить пользователя и отправить JWT
  createSendToken(user, 200, res);
});
