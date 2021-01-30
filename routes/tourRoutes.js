const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router(); // создали отдельные раутеры для туров и пользователей

//router.param('id', (req, res, next, val) => {
//    console.log(`Tour id is: ${val}`) // в консоли мы увидим id которое запрашиваем в url
//    next()
//}) // когда мы поступает запрос содержащий доп.параметры например id тура, мы можем воспользоваться мидлваром чтобы получить у нему доступ через метод params. Тк это мидлвар нельзя забывать про ф-цию next() иначе req-res цикл застрянет

/* router.param('id', tourController.checkID); */

router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(/* tourController.checkBody, */ tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'), //пользователи с этими ролями могут удалять туры
    tourController.deleteTour
  );

module.exports = router;
