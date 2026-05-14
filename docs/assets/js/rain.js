// ==========================================
// 最后一页彩蛋：GPU / 小蛋糕雨
// ==========================================
let rainInterval = null;
let rainTimeout = null;

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
    // 🌟 只有当用户"滑走"离开这一页时，才立刻清屏
    const rainContainer = document.getElementById('rain-container');
    if (rainContainer) {
        rainContainer.innerHTML = '';
    }
}
