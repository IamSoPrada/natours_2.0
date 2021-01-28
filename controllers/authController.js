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
  // const newUser = await User.create({req.body}); // такая запись неправильная т.к берет и записывает данные из пост запроса из body. Это дает возможность создать пользователя с правами администратора, ниже запись правильная
  // все поля самописные поля из запросы не будут записаны в бд
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
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
