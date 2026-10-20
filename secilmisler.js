document.addEventListener('DOMContentLoaded', function () {
  const emptyStateEl = document.getElementById('wishlistEmptyState');
  const gridEl = document.getElementById('wishlistProductsGrid');

  function getAllProducts() {
    let all = [];
    if (typeof discountedProducts !== 'undefined') {
      for (let i = 0; i < discountedProducts.length; i++) {
        all.push(discountedProducts[i]);
      }
    }
    if (typeof bestSellerProducts !== 'undefined') {
      for (let i = 0; i < bestSellerProducts.length; i++) {
        all.push(bestSellerProducts[i]);
      }
    }
    if (typeof newProducts !== 'undefined') {
      for (let i = 0; i < newProducts.length; i++) {
        all.push(newProducts[i]);
      }
    }
    return all;
  }

  function findProductDetails(item) {
    let db = getAllProducts();
    let found = null;

    for (let i = 0; i < db.length; i++) {
      let p = db[i];
      if (item.id && String(p.id) === String(item.id)) {
        found = p;
        break;
      }
      if (item.title && p.title && p.title.trim() === item.title.trim()) {
        found = p;
        break;
      }
    }

    if (!found) {
      return item;
    }

    return {
      id: item.id || found.id,
      title: item.title || found.title,
      image: item.image || item.img || found.image || found.img || '',
      price: item.price != null ? item.price : found.price,
      oldPrice: item.oldPrice != null ? item.oldPrice : found.oldPrice,
      discount: item.discount != null ? item.discount : found.discount,
      rating: found.rating || item.rating || 5,
      reviewCount: found.reviewCount || item.reviewCount || 1,
      installment: found.installment || item.installment
    };
  }

  function formatMoney(val) {
    let num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  function renderWishlistCards() {
    if (!emptyStateEl || !gridEl) return;

    let wishlistItems = [];
    if (window.BirmarketWishlist && window.BirmarketWishlist.get) {
      wishlistItems = window.BirmarketWishlist.get();
    }

    if (!wishlistItems || wishlistItems.length === 0) {
      emptyStateEl.style.display = 'flex';
      gridEl.style.display = 'none';
      gridEl.innerHTML = '';
      return;
    }

    emptyStateEl.style.display = 'none';
    gridEl.style.display = 'grid';

    let cardsHtml = '';
    for (let i = 0; i < wishlistItems.length; i++) {
      let item = wishlistItems[i];
      let product = findProductDetails(item);

      let priceNum = parseFloat(product.price) || 0;
      let oldPriceNum = parseFloat(product.oldPrice) || 0;
      let formattedPrice = formatMoney(priceNum);
      let formattedOldPrice = oldPriceNum > 0 ? formatMoney(oldPriceNum) : '';

      let discount = product.discount;
      if (!discount && oldPriceNum > priceNum && oldPriceNum > 0) {
        discount = Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100);
      }

      let stars = '★★★★★';
      let ratingVal = parseInt(product.rating) || 5;
      if (ratingVal < 5) {
        stars = '★★★★☆';
      }
      let reviewCount = product.reviewCount || 1;

      let inCart = false;
      if (window.BirmarketCart && window.BirmarketCart.has) {
        inCart = window.BirmarketCart.has(product.id, product.title);
      }

      let discountTag = '';
      if (discount) {
        discountTag = '<span class="wishlist-card-discount">-' + discount + '%</span>';
      }

      let oldPriceTag = '';
      if (formattedOldPrice) {
        oldPriceTag = '<span class="wishlist-card-old-price">' + formattedOldPrice + ' ₼</span>';
      }

      cardsHtml += `
        <div class="wishlist-card-item" data-id="${product.id || ''}" data-title="${product.title || ''}">
          <div class="wishlist-card-img-wrap">
            <img src="${product.image || product.img || ''}" alt="${product.title || ''}" class="wishlist-card-img" loading="lazy">
            
            <button type="button" class="wishlist-card-heart-btn" title="Seçilmişlərdən sil">
              <svg viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            ${discountTag}
          </div>

          <div class="wishlist-card-body">
            <div class="wishlist-card-prices">
              <span class="wishlist-card-price">${formattedPrice} ₼</span>
              ${oldPriceTag}
            </div>

            <div class="wishlist-card-installment">
              5.11 ₼ x 24 ay
            </div>

            <h3 class="wishlist-card-title" title="${product.title || ''}">
              ${product.title || ''}
            </h3>

            <div class="wishlist-card-rating">
              <span class="wishlist-card-stars">${stars}</span>
              <span class="wishlist-card-reviews">${reviewCount} reytinq</span>
            </div>

            <button type="button" class="wishlist-card-cart-btn ${inCart ? 'in-cart' : ''}" data-original-text="Səbətə at">
              <svg viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>${inCart ? 'Səbətdə' : 'Səbətə at'}</span>
            </button>
          </div>
        </div>
      `;
    }

    gridEl.innerHTML = cardsHtml;

    if (window.BirmarketCart && window.BirmarketCart.syncAllCartButtons) {
      window.BirmarketCart.syncAllCartButtons();
    }
  }

  if (gridEl) {
    gridEl.addEventListener('click', function (e) {
      let heartBtn = e.target.closest('.wishlist-card-heart-btn');
      if (heartBtn) {
        e.preventDefault();
        let card = heartBtn.closest('.wishlist-card-item');
        if (!card) return;

        let id = card.getAttribute('data-id');
        let title = card.getAttribute('data-title');

        if (window.BirmarketWishlist) {
          window.BirmarketWishlist.remove(id, title);
        }

        card.remove();

        let remainingCards = gridEl.querySelectorAll('.wishlist-card-item');
        if (remainingCards.length === 0) {
          emptyStateEl.style.display = 'flex';
          gridEl.style.display = 'none';
        }
      }
    });
  }

  window.addEventListener('birmarket-wishlist-change', renderWishlistCards);
  window.addEventListener('storage', function (e) {
    if (e.key === 'birmarket_wishlist') {
      renderWishlistCards();
      if (window.BirmarketWishlist) {
        window.BirmarketWishlist.updateBadges();
      }
    }
  });

  renderWishlistCards();
});
