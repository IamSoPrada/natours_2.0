const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
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
    role: req.body.role
  }); // возвращает промис

  const token = signToken(newUser._id);

  res.status(201).json({
    stasus: 'success',
    token,
    data: {
      user: newUser
    }
  });
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
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
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
