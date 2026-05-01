// ==========================================
// 1. YouTube API 控制逻辑
// ==========================================
var player;
var progressInterval;
var isSeeking = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('hero-video', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
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

// ==========================================
// 2. 页面交互：导航、滚动控制、光效映射
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const slider = document.getElementById('nav-slider');
    const sections = document.querySelectorAll('.page-section');
    const scrollContainer = document.querySelector('.scroll-container');

    // 获取悬浮按钮组
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');

    // --- 导航栏果冻滑块更新 ---
    function updateSlider(link) {
        if (!slider) return;
        slider.style.width = `${link.offsetWidth}px`;
        slider.style.left = `${link.offsetLeft}px`;
    }

    if (navLinks.length > 0) updateSlider(navLinks[0]);

    // --- 智能滚动监听器 ---
    const observerOptions = {
        root: scrollContainer,
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(sections).indexOf(entry.target);
                if (index !== -1) {

                    // 1. 更新顶部导航栏
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLinks[index].classList.add('active');
                    updateSlider(navLinks[index]);

                    // 2. 智能控制“向上”翻页按钮
                    if (prevBtn) {
                        if (index === 0) {
                            // 第一页隐藏
                            prevBtn.style.opacity = '0';
                            prevBtn.style.pointerEvents = 'none';
                            prevBtn.style.transform = 'scale(0.8)';
                        } else {
                            // 其他页显示
                            prevBtn.style.opacity = '1';
                            prevBtn.style.pointerEvents = 'auto';
                            prevBtn.style.transform = 'scale(1)';
                        }
                    }

                    // 3. 智能控制“向下”翻页按钮
                    if (nextBtn) {
                        if (index === sections.length - 1) {
                            // 最后一页隐藏
                            nextBtn.style.opacity = '0';
                            nextBtn.style.pointerEvents = 'none';
                            nextBtn.style.transform = 'scale(0.8)';
                        } else {
                            // 其他页显示
                            nextBtn.style.opacity = '1';
                            nextBtn.style.pointerEvents = 'auto';
                            nextBtn.style.transform = 'scale(1)';
                        }
                    }
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 导航栏点击跳转
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

    // --- 侧边悬浮按钮点击翻页逻辑 ---
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const currentScroll = scrollContainer.scrollTop;
            const windowHeight = window.innerHeight;
            let currentIndex = Math.round(currentScroll / windowHeight);

            if (currentIndex < sections.length - 1) {
                sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const currentScroll = scrollContainer.scrollTop;
            const windowHeight = window.innerHeight;
            let currentIndex = Math.round(currentScroll / windowHeight);

            if (currentIndex > 0) {
                sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- 毛玻璃卡片光效坐标映射 ---
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
});