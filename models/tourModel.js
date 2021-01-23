const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour have a name'],
      unique: true,
      trim: true
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty']
    },
    ratingAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String], // массив строк
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true }, // обязательно доавить в нашу схему
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
}); // виртуальные свойства, их можно сгенерировать сразу как только подключились к бд
// будет работать на GET запрос

// DOCUMENT MIDDLEWARE выполняется перед .save() и .create()
tourSchema.pre('save', function(next) {
  //console.log(this); // в консоли будет документ перед отправкой в бд при POST запросе
  this.slug = slugify(this.name, { lower: true });
  next();
});

/* tourSchema.pre('save', function(next) {
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
}); */

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
