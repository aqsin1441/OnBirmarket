function setupBrandSlider(sliderWrapper) {
  if (!sliderWrapper) return;
  let track = sliderWrapper.querySelector('.brands-track');
  let prevBtn = sliderWrapper.querySelector('.brands-nav-prev');
  let nextBtn = sliderWrapper.querySelector('.brands-nav-next');
  let paginationContainer = sliderWrapper.parentElement.querySelector('.brands-pagination');
  let cards = track ? track.querySelectorAll('.brand-card') : [];

  if (!track || cards.length === 0) return;

  let currentIndex = 0;

  function getCardsPerView() {
    let width = window.innerWidth;
    if (width <= 768) return 3;
    if (width <= 1024) return 4;
    return 5;
  }

  function getStep() {
    if (cards.length >= 2) {
      return cards[1].offsetLeft - cards[0].offsetLeft;
    }
    return 200;
  }

  function getTotalPages() {
    let perView = getCardsPerView();
    return Math.ceil(cards.length / perView);
  }

  function renderDots() {
    if (!paginationContainer) return;
    let pages = getTotalPages();
    paginationContainer.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      let dot = document.createElement('button');
      dot.className = 'brands-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', function () {
        goToPage(i);
      });
      paginationContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!paginationContainer) return;
    let dots = paginationContainer.querySelectorAll('.brands-dot');
    let perView = getCardsPerView();
    let activePage = Math.floor(currentIndex / perView);
    for (let i = 0; i < dots.length; i++) {
      if (i === activePage) {
        dots[i].classList.add('active');
      } else {
        dots[i].classList.remove('active');
      }
    }
  }

  function updateArrows() {
    let perView = getCardsPerView();
    let maxIndex = cards.length - perView;
    if (prevBtn) {
      if (currentIndex <= 0) prevBtn.classList.add('disabled');
      else prevBtn.classList.remove('disabled');
    }
    if (nextBtn) {
      if (currentIndex >= maxIndex) nextBtn.classList.add('disabled');
      else nextBtn.classList.remove('disabled');
    }
  }

  function goToIndex(idx) {
    let perView = getCardsPerView();
    let maxIndex = cards.length - perView;
    if (idx < 0) idx = 0;
    if (idx > maxIndex) idx = maxIndex;
    currentIndex = idx;

    let step = getStep();
    let moveX = currentIndex * step;
    track.style.transition = 'transform 0.3s ease';
    track.style.transform = 'translateX(-' + moveX + 'px)';

    updateDots();
    updateArrows();
  }

  function goToPage(pageIdx) {
    let perView = getCardsPerView();
    goToIndex(pageIdx * perView);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function (e) {
      e.preventDefault();
      let perView = getCardsPerView();
      goToIndex(currentIndex + perView);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function (e) {
      e.preventDefault();
      let perView = getCardsPerView();
      goToIndex(currentIndex - perView);
    });
  }

  let isPointerDown = false;
  let startX = 0;
  let currentX = 0;
  let hasDragged = false;
  let startTranslate = 0;

  function onPointerStart(clientX) {
    isPointerDown = true;
    hasDragged = false;
    startX = clientX;
    currentX = clientX;
    startTranslate = currentIndex * getStep();
    track.style.transition = 'none';
  }

  function onPointerMove(clientX) {
    if (!isPointerDown) return;
    currentX = clientX;
    let diff = startX - currentX;
    if (Math.abs(diff) > 5) {
      hasDragged = true;
    }
    let target = startTranslate + diff;
    track.style.transform = 'translateX(-' + target + 'px)';
  }

  function onPointerEnd() {
    if (!isPointerDown) return;
    isPointerDown = false;

    let diff = startX - currentX;
    let perView = getCardsPerView();
    let threshold = 40;

    if (diff > threshold) {
      goToIndex(currentIndex + perView);
    } else if (diff < -threshold) {
      goToIndex(currentIndex - perView);
    } else {
      goToIndex(currentIndex);
    }

    setTimeout(function () {
      hasDragged = false;
    }, 50);
  }

  sliderWrapper.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
    if (e.target.closest('button')) return;
    e.preventDefault();
    onPointerStart(e.clientX);
  });

  window.addEventListener('mousemove', function (e) {
    if (isPointerDown) {
      onPointerMove(e.clientX);
    }
  });

  window.addEventListener('mouseup', function () {
    if (isPointerDown) {
      onPointerEnd();
    }
  });

  sliderWrapper.addEventListener('touchstart', function (e) {
    if (e.target.closest('button')) return;
    onPointerStart(e.touches[0].clientX);
  }, { passive: true });

  sliderWrapper.addEventListener('touchmove', function (e) {
    if (isPointerDown) {
      onPointerMove(e.touches[0].clientX);
    }
  }, { passive: true });

  sliderWrapper.addEventListener('touchend', function () {
    onPointerEnd();
  });

  sliderWrapper.addEventListener('click', function (e) {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  let imgs = sliderWrapper.querySelectorAll('img');
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].setAttribute('draggable', 'false');
    imgs[i].addEventListener('dragstart', function (e) {
      e.preventDefault();
    });
  }

  window.addEventListener('resize', function () {
    renderDots();
    goToIndex(currentIndex);
  });

  renderDots();
  goToIndex(0);
}

function initBrands() {
  let sliders = document.querySelectorAll('.brands-slider-wrapper');
  for (let i = 0; i < sliders.length; i++) {
    setupBrandSlider(sliders[i]);
  }
}

document.addEventListener('DOMContentLoaded', initBrands);
