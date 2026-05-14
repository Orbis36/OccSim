// ==========================================
// 动态多弹窗管理系统
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
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
