function createPanel() {
  let panel = document.getElementById('krtekpanel')
  if (panel) document.body.removeChild(panel)

  panel = document.createElement('div')
  panel.id = 'krtekpanel'
  panel.style.zIndex = 1000
  panel.style.fontSize = '36px'
  panel.style.width = 'auto'
  panel.style.backgroundColor = '#FFFFFF99'
  panel.style.position = 'fixed'
  panel.style.right = '15px'
  panel.style.top = '15px'

  panel.style.display = 'flex'
  panel.style.flexDirection = 'column'
  panel.style.alignItems = 'center'

  document.body.appendChild(panel)

  let counter = document.createElement('div')
  counter.id = 'krtekcounter'
  counter.style.color = '#555555'
  counter.textContent = '0'

  panel.appendChild(counter)

  let characterInfo = document.createElement('div')
  characterInfo.id = 'krtekcharacterinfo'
  characterInfo.style.color = '#555555'
  characterInfo.textContent = ''
  characterInfo.style.marginBottom = '10px'
  characterInfo.style.fontSize = '20px'
  panel.appendChild(characterInfo)

  let maxview = document.createElement('div')
  maxview.id = 'krtekmax'
  maxview.style.color = '#555555'
  maxview.textContent = ''
  maxview.style.fontSize = '20px'
  panel.appendChild(maxview)

  let sendButton = document.createElement('button')
  sendButton.textContent = 'Wysyłaj'
  sendButton.style.backgroundColor = 'green'
  sendButton.style.color = 'white'
  sendButton.style.padding = '5px 10px' // Zmniejszono padding dla przycisku
  sendButton.style.marginTop = '10px'
  sendButton.style.border = 'none'
  sendButton.style.cursor = 'pointer'
  sendButton.addEventListener('click', handleSendButtonClick)
  panel.appendChild(sendButton)
}

createPanel()

let sendToServer = false
function handleSendButtonClick() {
  let sendButton = document.querySelector('#krtekpanel button')

  if (!sendToServer) {
    sendButton.style.backgroundColor = 'red'
    sendToServer = true
  } else {
    sendButton.style.backgroundColor = 'green'
    sendToServer = false
  }
}

function setCounter(count) {
  let counter = document.getElementById('krtekcounter')
  counter.textContent = count
}

function setPlayerName(name, level) {
  let nameview = document.getElementById('krtekcharacterinfo')
  if (level == null) {
    level = ''
  }
  nameview.textContent = `${name} (${level})`
}

function setMax(max) {
  if (max.count == 0) {
    return
  }

  let maxview = document.getElementById('krtekmax')
  if (max.level == null) {
    max.level = ''
  }
  maxview.textContent = `Max: ${max.playerName} (${max.level}) - ${max.count}`
}

function resetMax() {
  let maxview = document.getElementById('krtekmax')
  maxview.textContent = ''
}

function scrapeData() {
  let responseContainingEle = document.getElementById('__interceptedData')
  if (responseContainingEle) {
    let response = responseContainingEle.innerHTML
    onRequest(response)
    responseContainingEle.remove()
    requestIdleCallback(scrapeData)
  } else {
    requestIdleCallback(scrapeData)
  }
}

let scrapbook = {}
let maxUnowned = { count: -Infinity, playerName: null, playerRank: 0 }
let enemy = { count: -Infinity, playerName: null, playerLevel: 0 }
let lastEnemy = { count: -Infinity, playerName: null, playerLevel: 0 }

async function sendDataToServer() {
  try {
    if (enemy.count == lastEnemy.count && enemy.playerName == lastEnemy.playerName) {
      return
    }
    if (enemy.count == -Infinity || enemy.playerName == null || enemy.playerLevel == 0) {
      return
    }
    if (enemy.count == 0) {
      return
    }

    const dataToSend = {
      name: enemy.playerName,
      itemCount: enemy.count,
      level: enemy.playerLevel,
    }

    fetch('http://localhost:3000/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data)
      })
      .catch((error) => {
        console.error('An error occurred while sending data to LOCAL server (kurowski):', error)
      })

    lastEnemy = enemy
    enemy = { count: -Infinity, playerName: null, playerLevel: 0 }
  } catch (error) {}
}

async function onRequest(text) {
  let lookatRegex = /otherplayer.playerlookat:([^&]+)/g
  let nameRegex = /otherplayername.r:([^&]+)/g
  let playerLevelRegex = /otherplayer\.playerlookat:\d+\/\d+\/(\d+)\/\d+/

  let playerLevelMatch = text.match(playerLevelRegex)
  let lookatMatch = text.match(lookatRegex)
  let nameMatch = text.match(nameRegex)

  if (lookatMatch && lookatMatch.length != 0 && nameMatch && nameMatch.length != 0) {
    if (playerLevelMatch) {
      try {
        const level = parseInt(playerLevelMatch[1])
        enemy.playerLevel = level
      } catch (error) {}
    }

    let items = parseLookat(lookatMatch[0].replace('otherplayer.playerlookat:', ''))

    let unownedCount = 0
    for (item of items) {
      if (item in scrapbook && !scrapbook[item]) {
        ++unownedCount
      }
    }

    enemy.count = unownedCount
    setCounter(unownedCount)

    let playerName = nameMatch[0].replace('otherplayername.r:', '')
    enemy.playerName = playerName
    setPlayerName(playerName, enemy.playerLevel)
    if (maxUnowned.count < unownedCount) {
      maxUnowned.count = unownedCount
      maxUnowned.playerName = playerName
      maxUnowned.level = enemy.playerLevel
      setMax(maxUnowned)
    }

    if (sendToServer) {
      sendDataToServer()
    }
  }

  let scrapbookRegex = /scrapbook.r:([^$]+)/g
  let scrapbookMatch = text.match(scrapbookRegex)
  if (scrapbookMatch && scrapbookMatch.length != 0) {
    scrapbook = parseScrapbook(scrapbookMatch[0].replace('scrapbook.r:', ''))
  }

  let combatRegex = /combatloglist.s/g
  let combatMatch = text.match(combatRegex)
  if (combatMatch) {
    maxUnowned = { count: -Infinity, playerName: null, playerRank: 0 }
    resetMax()
  }
}

window.addEventListener('load', async function () {
  const { fetch: origFetch } = window
  window.fetch = async (...args) => {
    const response = await origFetch(...args)

    const arrayBuffer = await response.clone().arrayBuffer()

    const decoded = new TextDecoder().decode(arrayBuffer)

    const dataDOMElement = document.createElement('div')
    dataDOMElement.id = '__interceptedData'
    dataDOMElement.innerText = decoded
    dataDOMElement.style.height = 0
    dataDOMElement.style.overflow = 'hidden'
    document.body.appendChild(dataDOMElement)

    return response
  }

  requestIdleCallback(scrapeData)
})
