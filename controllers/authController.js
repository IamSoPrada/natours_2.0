const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create({req.body}); // такая запись неправильная т.к берет и записывает данные из пост запроса из body. Это дает возможность создать пользователя с правами администратора, ниже запись правильная
  // все поля самописные поля из запросы не будут записаны в бд
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  }); // возвращает промис

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(201).json({
    stasus: 'success',
    token,
    data: {
      user: newUser
    }
  });
});
