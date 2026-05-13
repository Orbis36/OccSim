// ==========================================
// 1. YouTube API 控制逻辑
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


// ==========================================
// 2. 页面交互：导航、滚动控制、光效映射
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // === 核心逻辑：精准的自身毛玻璃悬浮放大 ===
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('zoomable-img')) {
            const original = e.target;

            // 防抖锁
            if (original.style.opacity === '0' || original.classList.contains('cloned-zoom-img') || original.dataset.isCloned) return;

            // 上锁，并临时把底层小图的鼠标样式改成放大镜（zoom-out）
            original.dataset.isCloned = 'true';
            original.style.cursor = 'zoom-out';

            const rect = original.getBoundingClientRect();
            const clone = original.cloneNode(true);

            clone.className = '';
            clone.classList.add('cloned-zoom-img');

            clone.style.position = 'fixed';
            clone.style.top = `${rect.top}px`;
            clone.style.left = `${rect.left}px`;
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;
            clone.style.margin = '0';
            clone.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            clone.style.zIndex = '9999';

            // 🌟 【最核心的一行魔法】：让克隆体对鼠标事件彻底隐身！
            // 此时你的鼠标滑动永远只会被底层 1 倍大小的小图感应到。
            clone.style.pointerEvents = 'none';

            clone.style.borderRadius = getComputedStyle(original).borderRadius;

            document.body.appendChild(clone);

            void clone.offsetWidth; // 强制重排，防止跳帧

            clone.style.transform = 'scale(3.2)';
            clone.style.boxShadow = '0 30px 70px rgba(0, 0, 0, 0.3)';
            clone.style.border = '1px solid rgba(255, 255, 255, 0.8)';

            // 🌟 监听【底层原图】的鼠标移出事件！
            // 只要鼠标离开原来那个 1 倍大小的小方块，立刻触发缩小动画，感应极其精确。
            original.addEventListener('mouseleave', function onLeave() {
                original.removeEventListener('mouseleave', onLeave);
                delete original.dataset.isCloned;
                original.style.cursor = ''; // 恢复鼠标样式

                clone.style.transform = 'scale(1)';
                clone.style.boxShadow = 'none';
                clone.style.border = '1px solid transparent';

                setTimeout(() => {
                    clone.remove();
                }, 400);
            });
        }
    });
    // ===================================

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

                    if (entry.target.id === 'rollout') {
                        const bars = entry.target.querySelectorAll('.apple-bar');
                        setTimeout(() => {
                            bars.forEach(bar => { bar.style.width = bar.getAttribute('data-width'); });
                        }, 200);
                    }

                    if (entry.target.id === 'diversity') {
                        const container = entry.target.querySelector('.diversity-container');
                        if (container) {
                            container.classList.add('active');
                            const rows = container.querySelectorAll('.seed-row');
                            rows.forEach((row, rowIndex) => {
                                const imgs = row.querySelectorAll('.pred-img');
                                imgs.forEach((img, imgIndex) => {
                                    const delay = 800 + (imgIndex * 300);
                                    setTimeout(() => {
                                        img.classList.add('show');
                                    }, delay);
                                });
                            });
                        }
                    }
                }
            }
            else {
                if (entry.target.id === 'rollout') {
                    const bars = entry.target.querySelectorAll('.apple-bar');
                    bars.forEach(bar => { bar.style.width = '0'; });
                }

                if (entry.target.id === 'diversity') {
                    const container = entry.target.querySelector('.diversity-container');
                    if (container) {
                        container.classList.remove('active');
                        const imgs = container.querySelectorAll('.pred-img');
                        imgs.forEach(img => {
                            img.classList.remove('show');
                        });
                    }
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
    function stopModalVideos() {
        modalPlayers.forEach((p, index) => {
            if(p && typeof p.pauseVideo === 'function') {
                p.pauseVideo();
            }
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

    const closeBtns = document.querySelectorAll('.modal-close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.video-modal-overlay');
            if (modal) modal.classList.remove('active');
            stopModalVideos();
        });
    });

    const overlays = document.querySelectorAll('.video-modal-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                stopModalVideos();
            }
        });
    });
});