const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
const csvParser = require('csv-parser')
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier

const csvFilePath = '../items.csv'

if (!fs.existsSync(csvFilePath)) {
	fs.writeFileSync(csvFilePath, '')
}

const csvStringifier = createCsvStringifier({
	path: csvFilePath,
	header: [
		{ id: 'name', title: 'Nazwa Postaci' },
		{ id: 'itemCount', title: 'Liczba Przedmiotów' },
		{ id: 'level', title: 'Poziom Postaci' },
		{ id: 'rank', title: 'Ranking' },
	],
})

let itemsList = []
let isDataLoaded = false

function loadDataFromCSV() {
	fs.createReadStream(csvFilePath)
		.pipe(csvParser())
		.on('data', row => {
			itemsList.push(row)
		})
		.on('end', () => {
			console.log('Items loaded from file.')
			isDataLoaded = true // Ustaw flagę na true po wczytaniu danych
		})
}

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
	res.setHeader('Access-Control-Allow-Credentials', true)
	next()
})

app.use(express.json())

app.use((req, res, next) => {
	if (!isDataLoaded) {
		res.status(503).send('Server is not ready. Please wait.')
	} else {
		next()
	}
})

app.post('/add', (req, res) => {
	const { name, itemCount, level, rank } = req.body
	const existingIndex = itemsList.findIndex(item => item['Nazwa Postaci'] == name)

	if (existingIndex !== -1) {
		itemsList[existingIndex].name = name
		itemsList[existingIndex].itemCount = itemCount
		itemsList[existingIndex].level = level
		itemsList[existingIndex].rank = rank
		console.log('Player ', name, ' (', level, ') ', 'was modified. Ranking:', rank, '. Item count: ', itemCount)
	} else {
		itemsList.push({ name, itemCount, level, rank })
		console.log('New player: ', name, ' (', level, '), Ranking: ', rank, ' - items count: ', itemCount)
	}

	console.log(csvStringifier.getHeaderString())
	console.log(csvStringifier.stringifyRecords(itemsList))

	const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(itemsList)

	fs.writeFile(csvFilePath, csvData, err => {
		if (err) {
			console.error('An error occurred while saving data:', error)
			res.status(500).send('An error occurred while saving data.')
		} else {
			res.send('Item added to file.')
		}
	})
})

app.get('/list', (req, res) => {
	res.json(itemsList)
})

loadDataFromCSV()
app.listen(port, () => {
	console.log(`Server works on http://localhost:${port}`)
})
