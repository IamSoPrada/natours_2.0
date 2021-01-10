const express = require('express')
const morgan = require('morgan')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

// 1) Middlewares
app.use(morgan('dev ')) //3rd party мидлвар который возвращает функцию логгер в консоль где видно http метод,
// путь (route), статус код и время в мс 

app.use(express.json()) // мидл вар который обрабатывает наш запрос (req)

app.use((req, res, next) => {

    console.log('Hello from the middleware!')
    next()
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
    // к поступающему запросу в этом мидлваре мы как бы добавили св-во requestTime
    // которое вызываем в методе getAllTours
})


// app.get('/api/v1/tours', getAllTours)

// app.get('/api/v1/tours/:id', getTour)

// app.post('/api/v1/tours', createTour)

// app.patch('/api/v1/tours/:id', updateTour)

// app.delete('/api/v1/tours/:id', deleteTour)


// 3)Routes


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app
