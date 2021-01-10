const fs = require("fs")
const express = require('express')
const morgan = require('morgan')
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

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)
// 2) Routes handlers

const getAllTours = (req, res) => {
    console.log(req.requestTime)
    res.status(200).json({
        status: 'Success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    })
}

const getTour = (req, res) => {
    console.log(req.params) // здесь дуступны наши переменные которые мы отправляем в запросе :id и  : fye
    const id = req.params.id * 1
    if (id > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        })
    }
    const tour = tours.find(el => el.id === id)
    res.status(200).json({
        status: 'Success',
        data: {
            tour
        }
    })
}
const createTour = (req, res) => {
    /*     console.log(req.body) // св-во body доступно нам тк мы используем мидлвар выше */

    const newId = tours[tours.length - 1].id + 1
    const newTour = Object.assign({ id: newId }, req.body)
    tours.push(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    })
    /*     res.send('done') // необходимо отправить в ответ что-то, чтобы завершить req-res цикл */
}

const updateTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        })
    }
    res.status(200).json({
        status: "success",
        data: {
            tour: '<Updated tour here...></Updated>'
        }
    })
}

const deleteTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        })
    }
    res.status(204).json({
        status: "success",
        data: null
    })
}

const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defined'
    })
}
const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defined'
    })
}
const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defined'
    })
}
const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defined'
    })
}
const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route not yet defined'
    })
}

// app.get('/api/v1/tours', getAllTours)

// app.get('/api/v1/tours/:id', getTour)

// app.post('/api/v1/tours', createTour)

// app.patch('/api/v1/tours/:id', updateTour)

// app.delete('/api/v1/tours/:id', deleteTour)


// 3)Routes

const tourRouter = express.Router() // создали отдельные раутеры для туров и пользователей
const userRouter = express.Router()

tourRouter.route('/')
    .get(getAllTours)
    .post(createTour)

tourRouter.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)

userRouter.route('/')
    .get(getAllUsers)
    .post(createUser)

userRouter.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

// 4) Start serber
const port = 3000
app.listen(port, () => {
    console.log(`App running on port ${port}`)
})
