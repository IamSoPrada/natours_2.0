const express = require('express');
const tourController = require('./../controllers/tourController')
const router = express.Router() // создали отдельные раутеры для туров и пользователей


router.route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour)

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router