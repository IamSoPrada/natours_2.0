const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // Отправляем ответ
  res.status(200).json({
    status: 'Success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Создать ошибку если пользователь отправляет пароль (пытается обновить)
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This rout is not for password updates. Please use /updateMyPasswords',
        400
      )
    );
  }
  // 2) Обновить данные пользователя
  const filteredBody = filterObj(req.body, 'name', 'email'); // Отфильтовываем поля которые нельзя обновлять
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'Success',
    data: {
      user: updatedUser
    }
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route not yet defined'
  });
};
