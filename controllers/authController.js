const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body); // возвращает промис
  res.status(201).json({
    stasus: 'success',
    data: {
      user: newUser
    }
  });
});
