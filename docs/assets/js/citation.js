// ==========================================
// BibTeX 引用复制按钮
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const copyBtn = document.getElementById('copy-bib-btn');
    const bibText = document.getElementById('bibtex-code');

    if (copyBtn && bibText) {
        copyBtn.addEventListener('click', () => {
            // 将 pre 标签中的文字复制到剪贴板
            navigator.clipboard.writeText(bibText.innerText).then(() => {
                const btnSpan = copyBtn.querySelector('span');
                const originalText = btnSpan.innerText;

                // 变成"已复制"状态的反馈
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
