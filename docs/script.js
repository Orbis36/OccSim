// ==========================================
// 1. YouTube API 控制逻辑
// ==========================================
var player;
var progressInterval;
var isSeeking = false;

// 动态管理所有弹窗视频的数组 (9 个视频)
var modalPlayers = [];
var modalIntervals = [];
var modalStarted = [];

function onYouTubeIframeAPIReady() {
    // =====================================
    // 1. 初始化主页的大视频 (完全保留你的原始代码)
    // =====================================
    player = new YT.Player('hero-video', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    // =====================================
    // 2. 自动初始化页面上所有的弹窗视频
    // =====================================
    const allModalIframes = document.querySelectorAll('.video-modal-overlay iframe');
    allModalIframes.forEach((iframe, index) => {
        // 确保每个 iframe 都有唯一的 id，防止冲突
        if (!iframe.id) {
            iframe.id = 'dynamic-modal-video-' + index;
        }
        // 每个视频都初始化一个“是否播放过”的状态
        modalStarted.push(false);
        // 绑定 YT Player，并分配索引
        modalPlayers[index] = new YT.Player(iframe.id, {
            events: {
                'onReady': () => initLocalControls(index),
                'onStateChange': (event) => onLocalStateChange(event, index)
            }
        });
    });
}

// =====================================
// 主页视频的交互逻辑 (你的原始代码)
// =====================================
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

// =====================================
// 弹窗独立视频绑定逻辑 (9个通用)
// =====================================
function initLocalControls(index) {
    const wrapper = document.querySelectorAll('.modal-iframe-wrapper')[index];
    if (!wrapper) return;

    const playBtn = wrapper.querySelector('.local-play-btn');
    const progressContainer = wrapper.querySelector('.local-progress-container');
    const progressBar = wrapper.querySelector('.local-progress-bar');
    let isLocalSeeking = false;

    // 自定义按钮播放/暂停
    playBtn.addEventListener('click', () => {
        const state = modalPlayers[index].getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            modalPlayers[index].pauseVideo();
        } else {
            modalPlayers[index].playVideo();
        }
    });

    // 拖动进度条
    progressContainer.addEventListener('click', (e) => {
        isLocalSeeking = true;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        progressBar.style.width = `${pos * 100}%`;
        modalPlayers[index].seekTo(pos * modalPlayers[index].getDuration(), true);
        setTimeout(() => { isLocalSeeking = false; }, 300);
    });

    // 自动更新进度条
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

// === 交互劫持核心 ===
function onLocalStateChange(event, index) {
    const wrapper = document.querySelectorAll('.modal-iframe-wrapper')[index];
    if (!wrapper) return;

    const playIcon = wrapper.querySelector('.local-play-icon');
    const pauseIcon = wrapper.querySelector('.local-pause-icon');
    const overlay = wrapper.querySelector('.modal-interactive-overlay');
    const customControls = wrapper.querySelector('.local-controls');

    // 如果视频开始播放
    if (event.data === YT.PlayerState.PLAYING) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';

        // 只要是第一次点击，立刻弹出遮罩和进度条，拦截鼠标事件
        if (!modalStarted[index]) {
            modalStarted[index] = true;
            if (overlay) overlay.classList.add('active');
            if (customControls) customControls.classList.add('visible');
        }
    } else {
        // 如果是暂停或缓冲状态
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}


// ==========================================
// 2. 页面交互：导航、滚动控制、光效映射
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const slider = document.getElementById('nav-slider');
    const sections = document.querySelectorAll('.page-section');
    const scrollContainer = document.querySelector('.scroll-container');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const navLogo = document.getElementById('nav-logo');

    function updateSlider(link) {
        if (!slider) return;
        slider.style.width = `${link.offsetWidth}px`;
        slider.style.left = `${link.offsetLeft}px`;
    }

    if (navLinks.length > 0) updateSlider(navLinks[0]);

    const observerOptions = { root: scrollContainer, threshold: 0.5 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(sections).indexOf(entry.target);
                if (index !== -1) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLinks[index].classList.add('active');
                    updateSlider(navLinks[index]);

                    if (navLogo) {
                        if (index === 0) { navLogo.classList.remove('visible'); }
                        else { navLogo.classList.add('visible'); }
                    }

                    if (prevBtn) {
                        if (index === 0) {
                            prevBtn.style.opacity = '0'; prevBtn.style.pointerEvents = 'none'; prevBtn.style.transform = 'scale(0.8)';
                        } else {
                            prevBtn.style.opacity = '1'; prevBtn.style.pointerEvents = 'auto'; prevBtn.style.transform = 'scale(1)';
                        }
                    }

                    if (nextBtn) {
                        if (index === sections.length - 1) {
                            nextBtn.style.opacity = '0'; nextBtn.style.pointerEvents = 'none'; nextBtn.style.transform = 'scale(0.8)';
                        } else {
                            nextBtn.style.opacity = '1'; nextBtn.style.pointerEvents = 'auto'; nextBtn.style.transform = 'scale(1)';
                        }
                    }

                    // 性能条的动画
                    if (entry.target.id === 'rollout') {
                        const bars = entry.target.querySelectorAll('.apple-bar');
                        setTimeout(() => {
                            bars.forEach(bar => { bar.style.width = bar.getAttribute('data-width'); });
                        }, 200);
                    }
                }
            }
            else {
                // 性能条抽回
                if (entry.target.id === 'rollout') {
                    const bars = entry.target.querySelectorAll('.apple-bar');
                    bars.forEach(bar => { bar.style.width = '0'; });
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    navLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            sections[index].scrollIntoView({ behavior: 'smooth' });
        });
    });

    window.addEventListener('resize', () => {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) updateSlider(activeLink);
    });

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const currentScroll = scrollContainer.scrollTop;
            const windowHeight = window.innerHeight;
            let currentIndex = Math.round(currentScroll / windowHeight);
            if (currentIndex < sections.length - 1) { sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' }); }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const currentScroll = scrollContainer.scrollTop;
            const windowHeight = window.innerHeight;
            let currentIndex = Math.round(currentScroll / windowHeight);
            if (currentIndex > 0) { sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' }); }
        });
    }

    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ==========================================
    // 3. 动态多弹窗管理系统
    // ==========================================

    // 关闭时彻底停止所有弹窗内视频
    function stopModalVideos() {
        modalPlayers.forEach((p, index) => {
            if(p && typeof p.pauseVideo === 'function') {
                p.pauseVideo();
            }
            // 重置拦截状态，方便用户下次打开重新点原生播放
            modalStarted[index] = false;
            const wrapper = document.querySelectorAll('.modal-iframe-wrapper')[index];
            if(wrapper) {
                const overlay = wrapper.querySelector('.modal-interactive-overlay');
                const customControls = wrapper.querySelector('.local-controls');
                if(overlay) overlay.classList.remove('active');
                if(customControls) customControls.classList.remove('visible');
            }
        });
    }

    // 绑定所有的缩略图点击事件 -> 打开对应的弹窗
    const thumbCards = document.querySelectorAll('.video-thumbnail-card');
    thumbCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetModalId = card.getAttribute('data-target');
            if (targetModalId) {
                const targetModal = document.getElementById(targetModalId);
                if (targetModal) {
                    targetModal.classList.add('active');
                }
            }
        });
    });

    // 绑定所有的关闭按钮
    const closeBtns = document.querySelectorAll('.modal-close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 找到离当前关闭按钮最近的弹窗并关闭
            const modal = e.target.closest('.video-modal-overlay');
            if (modal) modal.classList.remove('active');
            stopModalVideos();
        });
    });

    // 绑定点击灰色遮罩区域关闭弹窗
    const overlays = document.querySelectorAll('.video-modal-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            // 如果点到了透明灰色背景本身，而不是里面的白框内容
            if (e.target === overlay) {
                overlay.classList.remove('active');
                stopModalVideos();
            }
        });
    });
});