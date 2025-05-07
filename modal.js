document.addEventListener('DOMContentLoaded', () => {
    const modal      = document.getElementById('itemModal');
    if (!modal) return;

    const mImage     = document.getElementById('modalImage');
    const mName      = document.getElementById('modalName');
    const mDesc      = document.getElementById('modalDesc');
    const mPrice     = document.getElementById('modalPrice');
    const closeBtn   = modal.querySelector('.close-btn');
    const prevBtn    = modal.querySelector('.prev-btn');
    const nextBtn    = modal.querySelector('.next-btn');
    const items      = Array.from(document.querySelectorAll('.item[data-img][data-desc][data-price]'));
    let currentIndex = -1;
    let lastFocused  = null;

    const pageSiblings = Array.from(document.body.children).filter(el => el !== modal);

    function showItem(idx) {
        currentIndex = (idx + items.length) % items.length;       // ensure 0 ≤ currentIndex < items.length
        const item = items[currentIndex];
        lastFocused = document.activeElement;

        // populate
        mImage.src         = item.dataset.img;
        mImage.alt         = item.dataset.name;
        mName.textContent  = item.dataset.name;
        mDesc.textContent  = item.dataset.desc;
        mPrice.textContent = item.dataset.price;

        // show + inert background
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        pageSiblings.forEach(el => el.inert = true);

        closeBtn.focus();
    }

    // wire item clicks
    items.forEach((item, i) => item.addEventListener('click', () => showItem(i)));

    let touchStartX = null;

    // Record where the touch began
    modal.addEventListener('touchstart', e => {
        // Only consider single‐finger touches
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
        }
    });

    // When the finger lifts, compare positions
    modal.addEventListener('touchend', e => {
        if (touchStartX === null) return;

        const touchEndX = e.changedTouches[0].clientX;
        const deltaX    = touchEndX - touchStartX;
        const threshold = 50; // px – minimum swipe distance

        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                // swiped right → go to previous
                showItem(currentIndex - 1);
            } else {
                // swiped left → go to next
                showItem(currentIndex + 1);
            }
        }

        touchStartX = null; // reset
    });


    function closeModal() {
        document.activeElement.blur();
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        pageSiblings.forEach(el => el.inert = false);
        if (lastFocused) lastFocused.focus();
    }

    // circular prev/next
    prevBtn.addEventListener('click', () => showItem(currentIndex - 1));
    nextBtn.addEventListener('click', () => showItem(currentIndex + 1));

    // close & keyboard
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => {
        if (!modal.classList.contains('show')) return;
        switch (e.key) {
            case 'Escape':   return closeModal();
            case 'ArrowLeft':  return showItem(currentIndex - 1);
            case 'ArrowRight': return showItem(currentIndex + 1);
        }
    });
});
