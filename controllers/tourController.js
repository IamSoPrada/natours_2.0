const fs = require("fs")

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

exports.getAllTours = (req, res) => {
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

exports.getTour = (req, res) => {
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
exports.createTour = (req, res) => {
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

exports.updateTour = (req, res) => {
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

exports.deleteTour = (req, res) => {
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