// ==========================================
// YouTube API 控制逻辑
// ==========================================
var player;
var progressInterval;
var isSeeking = false;

var modalPlayers = [];
var modalIntervals = [];
var modalStarted = [];

function onYouTubeIframeAPIReady() {
    player = new YT.Player('hero-video', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    const allModalIframes = document.querySelectorAll('.video-modal-overlay iframe');
    allModalIframes.forEach((iframe, index) => {
        if (!iframe.id) {
            iframe.id = 'dynamic-modal-video-' + index;
        }
        modalStarted.push(false);
        modalPlayers[index] = new YT.Player(iframe.id, {
            events: {
                'onReady': () => initLocalControls(index),
                'onStateChange': (event) => onLocalStateChange(event, index)
            }
        });
    });
}

function onPlayerReady(event) {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');

    playPauseBtn.addEventListener('click', () => {
        const state = player.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });

    progressContainer.addEventListener('click', (e) => {
        isSeeking = true;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        progressBar.style.width = `${pos * 100}%`;
        const newTime = pos * player.getDuration();
        player.seekTo(newTime, true);
        setTimeout(() => { isSeeking = false; }, 300);
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
    });

    progressInterval = setInterval(() => {
        if (!isSeeking && player.getPlayerState() === YT.PlayerState.PLAYING) {
            const duration = player.getDuration();
            const currentTime = player.getCurrentTime();
            if (duration > 0) {
                const percent = (currentTime / duration) * 100;
                progressBar.style.width = `${percent}%`;
            }
        }
    }, 100);
}

function onPlayerStateChange(event) {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    if (event.data === YT.PlayerState.PLAYING) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

function initLocalControls(index) {
    const wrapper = document.querySelectorAll('.modal-iframe-wrapper')[index];
    if (!wrapper) return;

    const playBtn = wrapper.querySelector('.local-play-btn');
    const progressContainer = wrapper.querySelector('.local-progress-container');
    const progressBar = wrapper.querySelector('.local-progress-bar');
    let isLocalSeeking = false;

    playBtn.addEventListener('click', () => {
        const state = modalPlayers[index].getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            modalPlayers[index].pauseVideo();
        } else {
            modalPlayers[index].playVideo();
        }
    });

    progressContainer.addEventListener('click', (e) => {
        isLocalSeeking = true;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        progressBar.style.width = `${pos * 100}%`;
        modalPlayers[index].seekTo(pos * modalPlayers[index].getDuration(), true);
        setTimeout(() => { isLocalSeeking = false; }, 300);
    });

    modalIntervals[index] = setInterval(() => {
        if (!isLocalSeeking && modalPlayers[index] && modalPlayers[index].getPlayerState() === YT.PlayerState.PLAYING) {
            const duration = modalPlayers[index].getDuration();
            const currentTime = modalPlayers[index].getCurrentTime();
            if (duration > 0) {
                progressBar.style.width = `${(currentTime / duration) * 100}%`;
            }
        }
    }, 100);
}

function onLocalStateChange(event, index) {
    const wrapper = document.querySelectorAll('.modal-iframe-wrapper')[index];
    if (!wrapper) return;

    const playIcon = wrapper.querySelector('.local-play-icon');
    const pauseIcon = wrapper.querySelector('.local-pause-icon');
    const overlay = wrapper.querySelector('.modal-interactive-overlay');
    const customControls = wrapper.querySelector('.local-controls');

    if (event.data === YT.PlayerState.PLAYING) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';

        if (!modalStarted[index]) {
            modalStarted[index] = true;
            if (overlay) overlay.classList.add('active');
            if (customControls) customControls.classList.add('visible');
        }
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}
