const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
}); //  должно быть в начале кода чтобы отлавливать ошибки и исклчения

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose // подключаем к онлайн бд через монгус(слой асбтр. над монгодб)
  .connect(DB, {
    // метод коннект возвращает промис
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successfull');
  });

//console.log(app.get('env'))

//console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED EXception! Shutting down');
  console.log(err.name, err.message); //.name, err.message);

  server.close(() => {
    // таким образом мы обрубаем все запрусы идущие или происходящие в текущий момент
    process.exit(1);
  });
});
