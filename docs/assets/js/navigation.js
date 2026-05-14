// ==========================================
// 导航、滚动控制、光效映射
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

    // 1. 全新配置：抛弃比例计算，改用"屏幕中场线"感应
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
});
