document.addEventListener('DOMContentLoaded', function () {
  let sliderWrapper = document.getElementById('heroSlider');
  if (!sliderWrapper) return;

  let track = sliderWrapper.querySelector('.hero-swiper-track');
  let slides = sliderWrapper.querySelectorAll('.hero-slide');
  let dotsContainer = document.getElementById('heroPagination');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  let slideCount = slides.length;
  let AUTOPLAY_DELAY = 4500;

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slideCount; i++) {
      let dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        goToSlide(i);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    let dots = dotsContainer.querySelectorAll('.hero-dot');
    for (let i = 0; i < dots.length; i++) {
      if (i === currentIndex) {
        dots[i].classList.add('active');
      } else {
        dots[i].classList.remove('active');
      }
    }
  }

  function getSlideDistance() {
    if (slides.length <= 1) return sliderWrapper.clientWidth;
    return slides[1].offsetLeft - slides[0].offsetLeft;
  }

  function goToSlide(index, animate) {
    if (animate === undefined) animate = true;

    if (index < 0) {
      currentIndex = slideCount - 1;
    } else if (index >= slideCount) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    track.style.transition = animate ? 'transform 0.4s ease' : 'none';
    let distance = getSlideDistance();
    let moveX = currentIndex * distance;
    track.style.transform = 'translateX(-' + moveX + 'px)';

    updateDots();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  let isPointerDown = false;
  let startX = 0;
  let currentX = 0;
  let hasDragged = false;
  let startTranslate = 0;

  function onPointerStart(clientX) {
    stopAutoplay();
    isPointerDown = true;
    hasDragged = false;
    startX = clientX;
    currentX = clientX;
    startTranslate = currentIndex * getSlideDistance();
    track.style.transition = 'none';
    sliderWrapper.classList.add('is-dragging');
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
    sliderWrapper.classList.remove('is-dragging');

    let diff = startX - currentX;
    let threshold = 40;

    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    } else {
      goToSlide(currentIndex);
    }

    restartAutoplay();
    setTimeout(function () {
      hasDragged = false;
    }, 50);
  }

  sliderWrapper.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;
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

  sliderWrapper.addEventListener('mouseenter', function () {
    if (!isPointerDown) stopAutoplay();
  });

  sliderWrapper.addEventListener('mouseleave', function () {
    if (!isPointerDown) startAutoplay();
  });

  window.addEventListener('resize', function () {
    goToSlide(currentIndex, false);
  });

  goToSlide(0, false);
  startAutoplay();

  let featuresContainer = document.querySelector('.features-container');
  let scrollThumb = document.getElementById('featuresScrollThumb');
  if (featuresContainer && scrollThumb) {
    featuresContainer.addEventListener('scroll', function () {
      let maxScroll = featuresContainer.scrollWidth - featuresContainer.clientWidth;
      if (maxScroll > 0) {
        let percent = featuresContainer.scrollLeft / maxScroll;
        scrollThumb.style.left = (percent * 55) + '%';
      }
    }, { passive: true });
  }
});
