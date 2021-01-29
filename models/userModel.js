const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please provide your password'],
    minLength: 8,
    select: false // Это поле позволяет скрыть его для выдачи на клиент на output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password; // проверяем одинаковые ли пароли
      }, // будет работать только при сохранении on SAVE and CREATE, не работает при on UPDATE!
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: {
    type: Date
  }
});

//Чтобы зашифровать пароль юзера мы используем хук pre т.к для зашифровать пароль мы должны еще до сохранения переданных данный в бд.
//Эта функция будет работать только если именно пароль был измененб если нет то выход
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // this ссылается на текущий документ
  this.password = await bcrypt.hash(this.password, 12); // возвращает промис // число это cost cpu сколько будет затрачено ресурсов для шифрования..
  this.passwordConfirm = undefined; // само поле с подверждением пароля необходимо только для валидации. Поэтому после валидации мы его удалем таким образомю
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
