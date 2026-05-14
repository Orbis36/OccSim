// ==========================================
// 精准的自身毛玻璃悬浮放大效果
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
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
});
