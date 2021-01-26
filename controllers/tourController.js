const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage';
  req.query.fields = 'name,price,ratingAverage,summury,difficulty';
  next();
};

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

/* exports.checkID = (req, res, next, val) => {
  // мидлвар ф-ция проверяет валидность id до того как достигнет контроллера
  console.log(`Tour id is : ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }
  next();
}; */

/* exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(404).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};
 */
exports.getAllTours = catchAsync(async (req, res) => {
  // "Формируем запрос"
  // Фильтрация
  //const queryObj = { ...req.query };
  //const excludedFields = ['page', 'sort', 'limit', 'fields']; // поля которые мы не хотим чтоб были в запросе
  //excludedFields.forEach(el => delete queryObj[el]); // удаляем их
  //console.log(req.query, queryObj);

  // Продвинутая фильтрация
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // console.log(JSON.parse(queryStr));
  // console.log(req.query);
  // {difficulty: 'easy', duration: {$gte: 5}}

  //const tours = await Tour.find()
  //  .where('duration')
  //  .equals(5)
  //  .where('difficulty')
  //  .equals('easy');

  // let query = Tour.find(JSON.parse(queryStr)); // запрашиваем ВСЕ документы из бд в массиве

  // Сортировка(по цене по возрастанию)

  /*     if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      //console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    } */

  // Ограничение по поиску по полям (какие поля будут показаны)

  /*     if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    } */

  // Пагинация
  //page=2&limit=10
  /*     const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    } */

  // Совершаем запрос

  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // Отправляем ответ
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //console.log(req.params); // здесь дуступны наши переменные которые мы отправляем в запросе :id и  : fye
  //const id = req.params.id * 1;
  /*  const tour = tours.find(el => el.id === id);
  res.status(200).json({
    status: 'Success',
    data: {
      tour
    }
  }); */

  const { id } = req.params;
  const tour = await Tour.findById(id); // метод из мангуса
  // Tour.findOne({ _id: req.params.id }); тоже самое

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });

  //try {
  /*     console.log(req.body) // св-во body доступно нам тк мы используем мидлвар выше */
  /*   const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => { 
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  ); */
  /*     res.send('done') // необходимо отправить в ответ что-то, чтобы завершить req-res цикл */

  /*   const newTour = new Tour({})
          newTour.save() */

  // } catch (err) {
  //    res.status(400).json({
  //    status: 'fail',
  //  message: err
  //});
  //}
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // доп. условия переписывают пред. данные в бд
    runValidators: true
  });
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        //_id: '$ratingAverage',
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    //{
    //$match: { _id: { $ne: 'EASY' } }
    //}
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
