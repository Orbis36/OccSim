// ==========================================
// 1. YouTube API 控制逻辑
// ==========================================
var player;
var progressInterval;
var isSeeking = false;

var modalPlayers = [];
var modalIntervals = [];
var modalStarted = [];

let rainInterval = null;
let rainTimeout = null;

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


function createRaindrop() {
    const rainContainer = document.getElementById('rain-container');
    if (!rainContainer) return;

    const drop = document.createElement('div');
    drop.classList.add('rain-item');

    const img = document.createElement('img');

    // 50% 的概率是 GPU，50% 的概率是小蛋糕
    const isGPU = Math.random() > 0.3;
    if (isGPU) {
        img.src = 'figures/gpu-icon.png';
        img.classList.add('rain-img', 'gpu-img');
    } else {
        img.src = 'figures/cake-icon.png';
        img.classList.add('rain-img', 'cake-img');
    }
    // 将图片放入下落的容器中
    drop.appendChild(img);

    // 随机的横向起始位置 (0% 到 100%)
    drop.style.left = `${Math.random() * 100}%`;

    // 随机的下落持续时间 (3秒 到 7秒，造成错落感)
    const duration = Math.random() * 4 + 3;
    drop.style.animationDuration = `${duration}s`;

    // 随机的初始延迟 (避免一开始排队掉下来)
    const delay = Math.random() * 2;
    drop.style.animationDelay = `${delay}s`;

    // 随机的尺寸缩放 (0.7倍 到 1.3倍大小)
    const scale = Math.random() * 0.6 + 0.7;
    // 随机初始旋转角度
    const rotation = Math.random() * 360;

    // 注意：因为 CSS 动画里有 transform，这里的 inline transform 主要作用于初始状态
    drop.firstElementChild.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

    rainContainer.appendChild(drop);

    // 动画结束后，把 DOM 节点删掉，防止内存泄漏和页面卡顿
    setTimeout(() => {
        if (drop.parentNode) {
            drop.remove();
        }
    }, (duration + delay) * 1000);
}

function startRain() {
    if (!rainInterval) {

        rainInterval = setInterval(createRaindrop, 80);
        // 每 200 毫秒掉落一个，你可以改小这个数字让雨下得更大
        rainTimeout = setTimeout(() => {
            if (rainInterval) {
                clearInterval(rainInterval);
                rainInterval = null;
            }
        }, 5000);
    }
}

function stopRain() {
    // 停止产生新的雨滴
    if (rainInterval) {
        clearInterval(rainInterval);
        rainInterval = null;
    }
    // 取消可能还在计时的 5秒定时器（防止用户在5秒内滑走又滑回来导致逻辑错乱）
    if (rainTimeout) {
        clearTimeout(rainTimeout);
        rainTimeout = null;
    }
    // 🌟 只有当用户“滑走”离开这一页时，才立刻清屏
    const rainContainer = document.getElementById('rain-container');
    if (rainContainer) {
        rainContainer.innerHTML = '';
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
    const copyBtn = document.getElementById('copy-bib-btn');
    const bibText = document.getElementById('bibtex-code');

    function updateSlider(link) {
        if (!slider) return;
        slider.style.width = `${link.offsetWidth}px`;
        slider.style.left = `${link.offsetLeft}px`;
    }

    if (navLinks.length > 0) updateSlider(navLinks[0]);

    // 1. 全新配置：抛弃比例计算，改用“屏幕中场线”感应
    const observerOptions = {
        root: scrollContainer,
        threshold: 0,
        // 核心魔法：只把屏幕正中间约 20% 的高度作为"感应区"
        rootMargin: "-40% 0px -40% 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 抛弃比例计算，极其灵敏的探针逻辑
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

                    if (entry.target.id === 'rollout' || entry.target.id === 'diversity') {
                        const bars = entry.target.querySelectorAll('.apple-bar');
                        setTimeout(() => {
                            bars.forEach(bar => { bar.style.width = bar.getAttribute('data-width'); });
                        }, 100);
                    }

                    if (entry.target.id === 'Acknowledgement') {
                        startRain();
                    }

                    if (entry.target.id === 'rollout' || entry.target.id === 'diversity') {
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

                if (entry.target.id === 'Acknowledgement') {
                    stopRain();
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

    // 独立的、极其精确的当前页面检测函数
    function getActiveSectionIndex() {
        let activeIndex = 0;
        const viewportCenter = window.innerHeight / 2;
        sections.forEach((sec, index) => {
            const rect = sec.getBoundingClientRect();
            // 如果这个模块的顶部在屏幕中心之上，底部在屏幕中心之下
            // 物理意义：它正严丝合缝地覆盖着屏幕的视觉中心！
            if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
                activeIndex = index;
            }
        });
        return activeIndex;
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            let currentIndex = getActiveSectionIndex();
            if (currentIndex < sections.length - 1) {
                // 加上 block: 'start' 确保平滑滚动后，页面精准对齐到模块的最顶部
                sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            let currentIndex = getActiveSectionIndex();
            if (currentIndex > 0) {
                sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
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

    if (copyBtn && bibText) {
        copyBtn.addEventListener('click', () => {
            // 将 pre 标签中的文字复制到剪贴板
            navigator.clipboard.writeText(bibText.innerText).then(() => {
                const btnSpan = copyBtn.querySelector('span');
                const originalText = btnSpan.innerText;

                // 变成“已复制”状态的反馈
                btnSpan.innerText = 'Copied!';
                copyBtn.style.background = '#e8f5e9'; // 淡淡的绿色反馈
                copyBtn.style.borderColor = '#4caf50';

                // 2秒后恢复原样
                setTimeout(() => {
                    btnSpan.innerText = originalText;
                    copyBtn.style.background = '#ffffff';
                    copyBtn.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }
});