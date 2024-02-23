const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
const csvParser = require('csv-parser')
const { createObjectCsvWriter } = require('csv-writer')

const csvFilePath = 'items.csv'

if (!fs.existsSync(csvFilePath)) {
	fs.writeFileSync(csvFilePath, '')
}

const csvWriter = createObjectCsvWriter({
	path: csvFilePath,
	header: [
		{ id: 'name', title: 'Nazwa Postaci' },
		{ id: 'itemCount', title: 'Liczba Przedmiotów' },
		{ id: 'level', title: 'Poziom Postaci' },
	],
})

let itemsList = []

fs.createReadStream(csvFilePath)
	.pipe(csvParser())
	.on('data', row => {
		itemsList.push(row)
	})
	.on('end', () => {
		console.log('Items loades from file:', itemsList)
	})

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
	res.setHeader('Access-Control-Allow-Credentials', true)
	next()
})

app.use(express.json())

app.post('/add', (req, res) => {
	const { name, itemCount, level } = req.body

	const existingIndex = itemsList.findIndex(item => item.name === name)
	if (existingIndex !== -1) {
		itemsList[existingIndex].itemCount = itemCount
		itemsList[existingIndex].level = level
		console.log('Player ', name, ' (', level, ') ', 'was modified. Item count: ', itemCount)
	} else {
		itemsList.push({ name, itemCount, level })
		console.log('New player: ', name, ' (', level, ') ', '- ', itemCount)
	}

	csvWriter
		.writeRecords(itemsList)
		.then(() => {
			res.send('Item added to file.')
		})
		.catch(error => {
			console.error('An error occurred while saving data:', error)
			res.status(500).send('An error occurred while saving data.')
		})
})

app.get('/list', (req, res) => {
	res.json(itemsList)
})

app.listen(port, () => {
	console.log(`Server works on http://localhost:${port}`)
})
