function createPanel() {
  let panel = document.getElementById('krtekpanel')
  if (panel)
    document.body.removeChild(panel)

  panel = document.createElement('div')

  panel.id = 'krtekpanel'
  panel.style.zIndex = 1000
  panel.style.fontSize = '48px'
  panel.style.width = 'auto'
  panel.style.backgroundColor = '#FFFFFF33'
  panel.style.position = 'fixed'
  panel.style.right = '15px'
  panel.style.top = '15px'

  panel.style.display = 'flex'
  panel.style.flexDirection = 'column'
  panel.style.alignItems = 'center'

  document.body.appendChild(panel)

  let counter = document.createElement('div')
  counter.id = 'krtekcounter'
  counter.style.color = 'white'
  counter.textContent = '0'
  panel.appendChild(counter)

  let nameview = document.createElement('div')
  nameview.id = 'krteknametag'
  nameview.style.color = 'white'
  nameview.textContent = ''
  nameview.style.fontSize = '15px'
  panel.appendChild(nameview)

  let maxview = document.createElement('div')
  maxview.id = 'krtekmax'
  maxview.style.color = 'white'
  maxview.textContent = ''
  maxview.style.fontSize = '15px'
  panel.appendChild(maxview)
}

createPanel()

function setCounter(count) {
  let counter = document.getElementById('krtekcounter')
  counter.textContent = count
}

function setPlayerName(name) {
  let nameview = document.getElementById('krteknametag')
  nameview.textContent = name
}

function setMax(max) {
  let maxview = document.getElementById('krtekmax')
  maxview.textContent = `Max: ${max.playerRank} - ${max.playerName} ${max.count}`
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

async function onRequest(text) {
  let lookatRegex = /otherplayer.playerlookat:([^&]+)/g
  let nameRegex = /otherplayername.r:([^&]+)/g

  let lookatMatch = text.match(lookatRegex)
  let nameMatch = text.match(nameRegex)
  if (lookatMatch && lookatMatch.length != 0 && nameMatch && nameMatch.length != 0) {
    let items = parseLookat(lookatMatch[0].replace('otherplayer.playerlookat:', ''))

    let unownedCount = 0
    for (item of items) {
      if (item in scrapbook && !scrapbook[item]) {
        ++unownedCount
      }
    }

    setCounter(unownedCount)

    let playerName = nameMatch[0].replace('otherplayername.r:', '')
    setPlayerName(playerName)
    if (maxUnowned.count < unownedCount) {
      maxUnowned.count = unownedCount
      maxUnowned.playerName = playerName
      maxUnowned.playerRank = parseInt(lookatMatch[0].replace('otherplayer.playerlookat:', '').split('/')[6])
      setMax(maxUnowned)
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


window.addEventListener('load', async function() {

  const { fetch: origFetch } = window
  window.fetch = async (...args) => {
    console.log('fetch called with args:', args)
    const response = await origFetch(...args)

    const arrayBuffer = await response
      .clone()
      .arrayBuffer()

    const decoded = new TextDecoder().decode(arrayBuffer)
    console.log(arrayBuffer)
    console.log(decoded)

    const dataDOMElement = document.createElement('div')
    dataDOMElement.id = '__interceptedData'
    dataDOMElement.innerText = decoded
    dataDOMElement.style.height = 0
    dataDOMElement.style.overflow = 'hidden'
    document.body.appendChild(dataDOMElement)

    return response
  }

  requestIdleCallback(scrapeData)


  // window.fetch = new Proxy(window.fetch, {
  //   apply: async function(target, that, args) {
  //
  //
  //     // args holds argument of fetch function
  //     // Do whatever you want with fetch request
  //     let temp = target.apply(that, args);
  //
  //     const url = args[0];
  //     const options = args[1];
  //
  //     let resData = null;
  //     await temp.then((res) => {
  //
  //       if (res.url.includes('req.php') && res.url.includes('sfgame') && res.status === 200) {
  //
  //         resData = res;
  //
  //         console.log(resData, options)
  //
  //
  //       }
  //
  //     })
  //
  //
  //     // temp.then((e) => {
  //     //   // console.log(e, t)
  //     //   // return this.onProgress(data)
  //     //   return data
  //     // })
  //
  //     // args.onProgress = args.onProgress.bind()then((one) => {
  //     //   console.log(one)
  //     //   return one;
  //     // })
  //
  //     // temp.then(async (res) => {
  //     //   // After completion of request
  //     //   console.log('[SFBOT:] ', res)
  //     //
  //     //
  //     //   if (res.url.includes('req.php') && res.url.includes('sfgame') && res.status === 200) {
  //     //     let dataDOMElement = document.createElement('div')
  //     //
  //     //     const parsedBody = res.parsedBody
  //     //
  //     //     console.log(res.json())
  //     //
  //     //
  //     //     let e = new TextDecoder
  //     //
  //     //     const decoded = await Promise.resolve(new TextDecoder().decode(res.parsedBody))
  //     //
  //     //     console.log('[SFBOT:] decoded', decoded)
  //     //
  //     //     dataDOMElement.id = '__interceptedData'
  //     //     dataDOMElement.innerText = decoded
  //     //     dataDOMElement.style.height = 0
  //     //     dataDOMElement.style.overflow = 'hidden'
  //     //     document.body.appendChild(dataDOMElement)
  //     //
  //     //     return decoded
  //     //   }
  //     //
  //     // }
  //
  //     return temp
  //   },
  // });

})


