const fs = require("fs")
const express = require('express')
const app = express()

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

// app.get('/api/v1/tours', getAllTours)

// app.get('/api/v1/tours/:id', getTour)

// app.post('/api/v1/tours', createTour)

// app.patch('/api/v1/tours/:id', updateTour)

// app.delete('/api/v1/tours/:id', deleteTour)

app.route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour)

app.route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)


const port = 3000
app.listen(port, () => {
    console.log(`App running on port ${port}`)
})