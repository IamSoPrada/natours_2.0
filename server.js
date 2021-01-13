const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose // подключаем к онлайн бд через монгус(слой асбтр. над монгодб)
  .connect(DB, {
    // метод коннект возвращает промис
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connection successfull');
  });

//console.log(app.get('env'))

//console.log(process.env)

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
