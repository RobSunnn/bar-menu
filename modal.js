document.addEventListener('DOMContentLoaded', () => {
    const modal        = document.getElementById('itemModal');
    if (!modal) return;

    const modalContent = modal.querySelector('.modal-content');
    const mImage       = document.getElementById('modalImage');
    const mName        = document.getElementById('modalName');
    const mDesc        = document.getElementById('modalDesc');
    const mPrice       = document.getElementById('modalPrice');
    const closeBtn     = modal.querySelector('.close-btn');
    const prevBtn      = modal.querySelector('.prev-btn');
    const nextBtn      = modal.querySelector('.next-btn');
    const items        = Array.from(document.querySelectorAll('.item[data-img][data-desc][data-price]'));
    let currentIndex   = -1;
    let lastFocused    = null;
    const pageSiblings = Array.from(document.body.children).filter(el => el !== modal);

    function showItem(idx) {
        currentIndex = (idx + items.length) % items.length;
        const item = items[currentIndex];
        lastFocused = document.activeElement;

        mImage.src         = item.dataset.img;
        mImage.alt         = item.dataset.name;
        mName.textContent  = item.dataset.name;
        mDesc.textContent  = item.dataset.desc;
        mPrice.textContent = item.dataset.price;

        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        pageSiblings.forEach(el => el.inert = true);
        closeBtn.focus();
    }

    items.forEach((item, i) => {
        item.addEventListener('click', () => showItem(i));
    });

    function closeModal() {
        document.activeElement.blur();
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        pageSiblings.forEach(el => el.inert = false);
        if (lastFocused) lastFocused.focus();
    }

    prevBtn.addEventListener('click', () => showItem(currentIndex - 1));
    nextBtn.addEventListener('click', () => showItem(currentIndex + 1));

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => {
        if (!modal.classList.contains('show')) return;
        if (e.key === 'Escape') return closeModal();
        if (e.key === 'ArrowLeft') return showItem(currentIndex - 1);
        if (e.key === 'ArrowRight') return showItem(currentIndex + 1);
    });

    // --- Touch swipe support on real devices ---
    let startX = null;

    // Use pointer events if available
    if (window.PointerEvent) {
        modalContent.addEventListener('pointerdown', e => {
            if (e.pointerType === 'touch') startX = e.clientX;
        });
        modalContent.addEventListener('pointerup', e => {
            if (startX === null) return;
            const delta = e.clientX - startX;
            if (Math.abs(delta) > 50) {
                delta > 0
                    ? showItem(currentIndex - 1)
                    : showItem(currentIndex + 1);
            }
            startX = null;
        });
    } else {
        // Fallback to touch events
        modalContent.addEventListener('touchstart', e => {
            if (e.touches.length === 1) startX = e.touches[0].clientX;
        });
        modalContent.addEventListener('touchend', e => {
            if (startX === null) return;
            const delta = e.changedTouches[0].clientX - startX;
            if (Math.abs(delta) > 50) {
                delta > 0
                    ? showItem(currentIndex - 1)
                    : showItem(currentIndex + 1);
            }
            startX = null;
        });
    }
});
