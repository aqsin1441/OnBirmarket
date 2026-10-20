function initBestSellers() {
  let grid = document.getElementById('bestSellersGrid');
  if (!grid) return;

  let products = (typeof bestSellerProducts !== 'undefined') ? bestSellerProducts : [];
  if (products.length === 0) return;

  function formatMoney(val) {
    let num = parseFloat(val);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  let html = '';
  let limit = Math.min(15, products.length);

  for (let i = 0; i < limit; i++) {
    let product = products[i];
    let productId = product.id || (i + 21);
    let formattedPrice = formatMoney(product.price);
    let oldPriceNum = parseFloat(product.oldPrice) || 0;
    let priceNum = parseFloat(product.price) || 0;

    let hasOldPrice = oldPriceNum > priceNum;
    let formattedOldPrice = hasOldPrice ? formatMoney(oldPriceNum) : '';

    let discountVal = product.discount;
    if (!discountVal && hasOldPrice) {
      discountVal = Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100);
    }
    let isDiscounted = (discountVal && discountVal > 0);

    let isPartnerPremium = product.isPartnerPremium || (i === 4 || i === 6);
    let isNew = product.isNew || (i === 4 || i === 10 || i === 14);
    let isBestSeller = product.isBestSeller || (i === 8);

    let badgesHtml = '';
    if (isPartnerPremium) {
      badgesHtml += '<span class="badge-partner-premium">PARTNER PREMIUM</span>';
    }
    if (isNew) {
      badgesHtml += '<span class="badge-new">Yenilik</span>';
    }
    if (isBestSeller) {
      badgesHtml += '<span class="badge-bestseller">Ən çox satılan</span>';
    }

    let hasRating = product.rating && product.rating > 0;
    let ratingHtml = '';
    if (hasRating) {
      ratingHtml = `
        <span class="bestseller-stars">★★★★★</span>
        <span class="bestseller-rating-count">${product.reviewCount || 1} reytinq</span>
      `;
    }

    let deliveryText = product.delivery || ((i === 1 || i === 2 || i === 9 || i === 10 || i === 13) ? '16 oktyabr' : 'Sabah');

    let isWishlisted = false;
    if (window.BirmarketWishlist && window.BirmarketWishlist.has) {
      isWishlisted = window.BirmarketWishlist.has(productId, product.title);
    }

    let isInCart = false;
    if (window.BirmarketCart && window.BirmarketCart.has) {
      isInCart = window.BirmarketCart.has(productId, product.title);
    }

    let discountBadge = '';
    if (isDiscounted) {
      discountBadge = '<span class="bestseller-card-discount">-' + discountVal + ' %</span>';
    }

    let oldPriceBadge = '';
    if (isDiscounted && formattedOldPrice) {
      oldPriceBadge = '<span class="bestseller-card-old-price">' + formattedOldPrice + ' ₼</span>';
    }

    let encodedTitle = encodeURIComponent(product.title || '');

    html += `
      <div class="bestseller-card" data-id="${productId}">
        <button type="button" class="bestseller-card-wishlist ${isWishlisted ? 'active' : ''}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="${isWishlisted ? '#ea207e' : 'none'}" stroke="${isWishlisted ? '#ea207e' : 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <a href="details.htm?id=${productId}&title=${encodedTitle}" class="bestseller-card-img-wrap">
          <div class="bestseller-top-badges">
            ${badgesHtml}
          </div>

          <img src="${product.image || product.img || ''}" alt="${product.title || ''}" class="bestseller-card-img" loading="lazy">
          ${discountBadge}
        </a>

        <div class="bestseller-card-body">
          <div class="bestseller-card-price-row">
            <span class="bestseller-card-price ${isDiscounted ? '' : 'no-discount'}">${formattedPrice} <span class="azn-symbol">₼</span></span>
            ${oldPriceBadge}
          </div>

          <div class="bestseller-card-installment">
            5.11 ₼ x 24 ay
          </div>

          <h3 class="bestseller-card-title" title="${product.title || ''}"><a href="details.htm?id=${productId}&title=${encodedTitle}" style="color: inherit; text-decoration: none;">${product.title || ''}</a></h3>

          <div class="bestseller-card-rating">
            ${ratingHtml}
          </div>

          <button type="button" class="bestseller-card-btn ${isInCart ? 'in-cart' : ''}" data-original-text="${deliveryText}">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>${isInCart ? 'Səbətdə' : deliveryText}</span>
          </button>
        </div>
      </div>
    `;
  }

  grid.innerHTML = html;

  if (window.BirmarketCart && window.BirmarketCart.syncAllCartButtons) {
    window.BirmarketCart.syncAllCartButtons();
  }
}

document.addEventListener('DOMContentLoaded', initBestSellers);
