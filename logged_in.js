let videos = []

// Função para carregar os dados do JSON e exibir os vídeos na página
async function loadVideosFromJSON() {
  try {
    const response = await fetch('videos.json')
    videos = await response.json()
    console.log({ videos })
  } catch (error) {
    console.error('Erro ao carregar os dados do JSON:', error)
  }

  const videoContainer = document.getElementById('videoContainer')
  let html = ''

  for (let index = 0; index < videos.length; index++) {
    const videoInfo = videos[index]

    html += `
  <div class="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3">
    <h5 class="d-flex align-items-end font-weight-bolder" style="height:60px;">${videoInfo.title}</h5>
    <div id="video-container${index}" class="video-container">
      <video id="video${index}" poster="${videoInfo.poster}" 
        style="width:100%;"
        onclick="onclickVideo(event, ${index})"
        ontimeupdate="timeupdateVideo(event, ${index})"
        oncanplay="oncanplayVideo(event, ${index})">
      </video>
      <div class="custom-controls" style="font-size:xx-small;">
        <div class="d-flex">
          <button id="play-pause-btn${index}" class="p-1 control-elem" onclick="onclickVideo(event, ${index})">Play</button>
          <input id="seek-slider${index}" class="p-1 control-elem" type="range" min="0" value="0" style="width:40%">
          <div class="p-1 control-elem">
            <span id="current-time${index}">0:00</span>
            <span>/</span>
            <span id="duration${index}">0:00</span>
          </div>
          <select class="p-1 control-elem" style="width:50px;"
            onchange="setResolution(event, ${index}, this.selectedIndex)">
            <option value="-1">auto</option>
            <option value="2">270p</option>
            <option value="5">360p</option>
            <option value="8">540p</option>
            <option value="10">720p</option>
            <option value="14">1080p</option>
            <option value="15">4K</option>
            </select>
        </div>
      </div>
    </div>
    <p style="font-size: 11px;">${videoInfo.sinopse}</p>
  </div>
`
  }

  // <div id="currentLevelControl" class="btn-group">
  // <button type="button" class="btn btn-primary" onclick="setResolution(${index}, -1)">auto</button>
  // <button type="button" class="btn btn-primary" onclick="setResolution(${index}, 2)">270p</button>
  // <button type="button" class="btn btn-primary" onclick="setResolution(${index}, 5)">360p</button>
  // <button type="button" class="btn btn-primary" onclick="setResolution(${index}, 8)">540p</button>
  // <button type="button" class="btn btn-primary" onclick="setResolution(${index}, 10)">720p</button>
  // <button type="button" class="btn btn-primary" onclick="setResolution(${index}, 14)">1080p</button>
  // </div>
  videoContainer.innerHTML = html
}

function fullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen()
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen()
  }
}

function exitFullscreen(elem) {
  if (elem.exitFullscreen) {
    elem.exitFullscreen()
  } else if (elem.msExitFullscreen) {
    elem.msExitFullscreen()
  } else if (elem.mozCancelFullScreen) {
    elem.mozCancelFullScreen()
  } else if (elem.webkitExitFullscreen) {
    elem.webkitExitFullscreen()
  }
}

function handleError(event, data) {
  console.error(data.error)
  console.error('Error details:', data.details)
}

function logLevel(videoInfo) {
  const {
    currentLevel,
    nextLevel,
    loadLevel,
    manualLevel,
    nextLoadLevel,
    startLevel,
    levels
  } = videoInfo.hls
  console.log({
    resolution: levels?.[currentLevel]?._attrs?.[0]?.RESOLUTION,
    height: levels?.[currentLevel]?.height,
    currentLevel,
    nextLevel,
    loadLevel,
    manualLevel,
    nextLoadLevel,
    startLevel,
    levels
  })
}

function getVideoHls(videoInfo) {
  console.log('getVideoHls', videoInfo)
  if (!videoInfo.hls) {
    var config = {
      startPosition: -1,
      debug: true,
      autoStartLoad: true
    }
    videoInfo.hls = new Hls(config)
    videoInfo.hls.on(Hls.Events.ERROR, handleError)
    logLevel(videoInfo)
    videoInfo.hls.loadSource(videoInfo.videoSrc)
    videoInfo.hls.attachMedia(videoInfo.video)
    videoInfo.hls.currentLevel = videoInfo.currentLevel || -1
    logLevel(videoInfo)
    return false
  }
  return true
}

// Função para carregar os vídeos
function onclickVideo(event, index) {
  console.log('onclickVideo: ', index)
  // here I want to prevent default
  event = event || window.event
  event.preventDefault()
  const videoInfo = videos[index]
  if (videoInfo.video.paused) {
    console.log('play')
    if (getVideoHls(videoInfo)) {
      oncanplayVideo(event, index)
    }
  } else {
    console.log('pause')
    videoInfo.video.pause()
    const playPauseBtn = document.getElementById('play-pause-btn' + index)
    playPauseBtn.textContent = 'Play'
    exitFullscreen(document.getElementById('video-container' + index))
  }
}

// Função para iniciar o play
function oncanplayVideo(event, index) {
  console.log('oncanplayVideo: ', index)
  // here I want to prevent default
  event = event || window.event
  event.preventDefault()
  const videoInfo = videos[index]
  videoInfo.video.play()
  const playPauseBtn = document.getElementById('play-pause-btn' + index)
  playPauseBtn.textContent = 'Pause'
  fullscreen(document.getElementById('video-container' + index))
}

function timeupdateVideo(event, index) {
  console.log('timeupdateVideo: ', index)
  // here I want to prevent default
  event = event || window.event
  event.preventDefault()
  const videoInfo = videos[index]
  const currentTimeMinutes = Math.floor(videoInfo.video.currentTime / 60)
  const currentTimeSeconds = Math.floor(videoInfo.video.currentTime - currentTimeMinutes * 60)
  const currentTime = document.getElementById('current-time' + index)
  currentTime.textContent = `${currentTimeMinutes}:${currentTimeSeconds.toString().padStart(2, '0')}`
  const durationMinutes = Math.floor(videoInfo.video.duration / 60)
  const durationSeconds = Math.floor(videoInfo.video.duration - durationMinutes * 60)
  const duration = document.getElementById('duration' + index)
  duration.textContent = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`
  logLevel(videoInfo)
}

// Função para definir a resolução do vídeo
function setResolution(event, index, level) {
  console.log('setResolution: ', index, level)
  // here I want to prevent default
  event = event || window.event
  event.preventDefault()
  const videoInfo = videos[index]
  videoInfo.currentLevel = level
  if (videoInfo.hls) {
    videoInfo.hls.currentLevel = level
  }
}

// Função para configurar o vídeo
function setVideo(index) {
  console.log('setVideo ', index)
  const tagVideo = 'video' + index
  const video = document.getElementById(tagVideo)
  videos[index].video = video
  if (Hls.isSupported()) {
    console.log('Hls is supported')
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    console.log('native browser HLS is supported')
    video.src = videoSrc
  } else {
    console.log('Hls is not supported')
  }
}

async function main() {
  // Carregar os vídeos da JSON na página
  await loadVideosFromJSON()

  // Criar os controles hls
  for (let index = 0; index < videos.length; index++) {
    setVideo(index)
  }
}

main()