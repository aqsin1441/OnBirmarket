function initDailyDeals() {
  let track = document.getElementById('dailyDealsTrack');
  let prevBtn = document.getElementById('dealsPrevBtn');
  let nextBtn = document.getElementById('dealsNextBtn');
  let paginationContainer = document.getElementById('dailyDealsPagination');
  let countdownEl = document.getElementById('dailyDealsCountdown');
  let sliderWrapper = document.getElementById('dailyDealsSlider');

  if (!track) return;

  let products = (typeof discountedProducts !== 'undefined') ? discountedProducts : [];
  if (products.length === 0) return;

  function formatMoney(num) {
    let val = parseFloat(num);
    if (isNaN(val)) return '0.00';
    return val.toFixed(2);
  }

  function renderCards() {
    let html = '';
    for (let i = 0; i < products.length; i++) {
      let product = products[i];
      let formattedPrice = formatMoney(product.price);
      let formattedOldPrice = product.oldPrice ? formatMoney(product.oldPrice) : '';

      let ratingStars = '★★★★★';
      if (!product.rating || product.rating <= 0) {
        ratingStars = '☆☆☆☆☆';
      }

      let isWishlisted = false;
      if (window.BirmarketWishlist && window.BirmarketWishlist.has) {
        isWishlisted = window.BirmarketWishlist.has(product.id, product.title);
      }

      let isInCart = false;
      if (window.BirmarketCart && window.BirmarketCart.has) {
        isInCart = window.BirmarketCart.has(product.id, product.title);
      }

      let discountTag = '';
      if (product.discount) {
        discountTag = '<span class="deal-card-discount">-' + product.discount + ' %</span>';
      }

      let oldPriceTag = '';
      if (formattedOldPrice) {
        oldPriceTag = '<span class="deal-card-old-price">' + formattedOldPrice + ' ₼</span>';
      }

      let ratingCountTag = '';
      if (product.rating > 0) {
        ratingCountTag = '<span class="deal-rating-count">' + (product.reviewCount || 1) + ' reytinq</span>';
      }

      let encodedTitle = encodeURIComponent(product.title || '');

      html += `
        <div class="deal-card" data-id="${product.id}">
          <button type="button" class="deal-card-wishlist ${isWishlisted ? 'active' : ''}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="${isWishlisted ? '#ea207e' : 'none'}" stroke="${isWishlisted ? '#ea207e' : 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <a href="details.htm?id=${product.id}&title=${encodedTitle}" class="deal-card-img-wrap">
            <img src="${product.image}" alt="${product.title}" class="deal-card-img" loading="lazy">
            ${discountTag}
          </a>

          <div class="deal-card-body">
            <div class="deal-card-price-row">
              <span class="deal-card-price">${formattedPrice} <span class="azn-symbol">₼</span></span>
              ${oldPriceTag}
            </div>

            <div class="deal-card-promo-timer">
              Aksiya: <span class="deal-timer-val">${product.timer || '14:39:27'}</span>
            </div>

            <div class="deal-card-installment">
              5.11 ₼ x 24 ay
            </div>

            <h3 class="deal-card-title" title="${product.title}"><a href="details.htm?id=${product.id}&title=${encodedTitle}" style="color: inherit; text-decoration: none;">${product.title}</a></h3>

            <div class="deal-card-rating">
              <span class="deal-stars ${product.rating > 0 ? '' : 'no-rating'}">${ratingStars}</span>
              ${ratingCountTag}
            </div>

            <button type="button" class="deal-card-btn ${isInCart ? 'in-cart' : ''}" data-original-text="Sabah">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>${isInCart ? 'Səbətdə' : 'Sabah'}</span>
            </button>
          </div>
        </div>
      `;
    }
    track.innerHTML = html;
  }

  renderCards();

  let currentIndex = 0;

  function getCardsPerView() {
    let width = window.innerWidth;
    if (width <= 768) return 3;
    if (width <= 1024) return 4;
    return 5;
  }

  function getCardStep() {
    let cards = track.querySelectorAll('.deal-card');
    if (cards.length >= 2) {
      return cards[1].offsetLeft - cards[0].offsetLeft;
    }
    if (cards.length === 1) {
      return cards[0].offsetWidth + 14;
    }
    return 220;
  }

  function getTotalPages() {
    let perView = getCardsPerView();
    return Math.ceil(products.length / perView);
  }

  function renderDots() {
    if (!paginationContainer) return;
    let pages = getTotalPages();
    paginationContainer.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      let dot = document.createElement('button');
      dot.className = 'deals-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', function () {
        goToPage(i);
      });
      paginationContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!paginationContainer) return;
    let dots = paginationContainer.querySelectorAll('.deals-dot');
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
    let maxIndex = products.length - perView;
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
    let maxIndex = products.length - perView;
    if (idx < 0) idx = 0;
    if (idx > maxIndex) idx = maxIndex;
    currentIndex = idx;

    let step = getCardStep();
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
    startTranslate = currentIndex * getCardStep();
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

  if (sliderWrapper) {
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
  }

  let totalSeconds = 14 * 3600 + 39 * 60 + 27;
  function updateCountdown() {
    if (totalSeconds > 0) totalSeconds--;
    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    let timeStr = (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);

    if (countdownEl) {
      countdownEl.textContent = timeStr;
    }

    let timerBadges = track.querySelectorAll('.deal-timer-val');
    for (let i = 0; i < timerBadges.length; i++) {
      timerBadges[i].textContent = timeStr;
    }
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  window.addEventListener('resize', function () {
    renderDots();
    goToIndex(currentIndex);
  });

  renderDots();
  goToIndex(0);
}

document.addEventListener('DOMContentLoaded', initDailyDeals);
