const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();
const sendEmail = async options => {
  // 1) Создать transporter (сервис который и будет отправлять письмо)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      /*       user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD */
      user: 'matilde.bayer@ethereal.email',
      pass: '6f9usXz9JJ2kD9BKd6'
    }, // баг. email и pass должны подтягиваться с config файла
    tls: {
      rejectUnauthorized: false
    }
    // Активировать в гмайле less secure app option
  });
  // 2) Определить email варинаты
  const mailOptions = {
    from: 'Rustem Karasevich <matilde.bayer@ethereal.email>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html:
  };
  // 3) Отправить письмо
  await transporter.sendMail(mailOptions); //возвращает промис
};

module.exports = sendEmail;
