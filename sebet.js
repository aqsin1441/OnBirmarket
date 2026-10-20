document.addEventListener('DOMContentLoaded', function () {
  const emptyBoxEl = document.getElementById('cartEmptyBox');
  const contentBoxEl = document.getElementById('cartContentBox');
  const itemsListEl = document.getElementById('cartItemsList');
  const subtitleEl = document.getElementById('cartCountSubtitle');
  const summaryLabelEl = document.getElementById('cartSummaryLabel');
  const summaryTotalEl = document.getElementById('cartSummaryTotal');

  function formatMoney(val) {
    let num = parseFloat(val);
    if (isNaN(num)) {
      return '0.00';
    }
    return num.toFixed(2);
  }

  function renderCart() {
    if (!emptyBoxEl || !contentBoxEl || !itemsListEl) {
      return;
    }

    let items = [];
    if (window.BirmarketCart && window.BirmarketCart.get) {
      items = window.BirmarketCart.get();
    }

    if (!items || items.length === 0) {
      emptyBoxEl.style.display = 'flex';
      contentBoxEl.style.display = 'none';
      itemsListEl.innerHTML = '';
      return;
    }

    emptyBoxEl.style.display = 'none';
    contentBoxEl.style.display = 'block';

    let totalCount = 0;
    let grandTotal = 0;

    for (let i = 0; i < items.length; i++) {
      let count = parseInt(items[i].count) || 1;
      let price = parseFloat(items[i].price) || 0;
      totalCount = totalCount + count;
      grandTotal = grandTotal + (price * count);
    }

    if (subtitleEl) {
      subtitleEl.textContent = 'Səbətinizdə ' + totalCount + ' məhsul var';
    }
    if (summaryLabelEl) {
      summaryLabelEl.textContent = 'Sifarişin məbləği (' + totalCount + ' məhsul):';
    }
    if (summaryTotalEl) {
      summaryTotalEl.textContent = formatMoney(grandTotal) + ' ₼';
    }

    let cardsHtml = '';
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let count = parseInt(item.count) || 1;
      let priceNum = parseFloat(item.price) || 0;
      let oldPriceNum = parseFloat(item.oldPrice) || 0;
      let subtotal = priceNum * count;

      let discountHtml = '';
      if (item.discount) {
        discountHtml = '<span class="cart-item-discount">-' + item.discount + '%</span>';
      }

      let oldPriceHtml = '';
      if (oldPriceNum > 0) {
        oldPriceHtml = '<span class="cart-item-old-price">' + formatMoney(oldPriceNum) + ' ₼</span>';
      }

      let minusDisabled = '';
      if (count <= 1) {
        minusDisabled = 'disabled';
      }

      cardsHtml += `
        <div class="cart-item-card" data-id="${item.id || ''}" data-title="${item.title || ''}">
          <div class="cart-item-checkbox-wrap">
            <div class="cart-item-check">
              <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>

          <div class="cart-item-img-wrap">
            <img src="${item.image || ''}" alt="${item.title || ''}" class="cart-item-img" loading="lazy">
          </div>

          <div class="cart-item-info">
            <div class="cart-item-delivery">Çatdırılma: <strong>${item.delivery || '17 oktyabr'}</strong></div>
            <h3 class="cart-item-name" title="${item.title || ''}">${item.title || ''}</h3>

            <div class="cart-item-price-row">
              ${discountHtml}
              <span class="cart-item-price">${formatMoney(priceNum)} ₼</span>
              ${oldPriceHtml}
            </div>

            <div class="cart-item-installment">5.11 ₼ x 24 ay</div>

            <div class="cart-item-controls-row">
              <div class="cart-qty-control" data-id="${item.id || ''}" data-title="${item.title || ''}">
                <button type="button" class="cart-qty-btn cart-qty-minus" ${minusDisabled}>-</button>
                <span class="cart-qty-val">${count}</span>
                <button type="button" class="cart-qty-btn cart-qty-plus">+</button>
              </div>
              <div class="cart-item-subtotal">Toplam ödəniş: <strong>${formatMoney(subtotal)} ₼</strong></div>
            </div>

            <button type="button" class="cart-item-remove-btn" data-id="${item.id || ''}" data-title="${item.title || ''}" title="Sil">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      `;
    }

    itemsListEl.innerHTML = '<div class="cart-item-group">' + cardsHtml + '</div>';
  }

  if (itemsListEl) {
    itemsListEl.addEventListener('click', function (e) {
      let plusBtn = e.target.closest('.cart-qty-plus');
      if (plusBtn) {
        e.preventDefault();
        let control = plusBtn.closest('.cart-qty-control');
        if (!control) return;

        let id = control.getAttribute('data-id');
        let title = control.getAttribute('data-title');
        let items = window.BirmarketCart ? window.BirmarketCart.get() : [];

        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if ((id && String(item.id) === String(id)) || (title && item.title === title)) {
            let currentCount = parseInt(item.count) || 1;
            window.BirmarketCart.updateQuantity(item.id, item.title, currentCount + 1);
            renderCart();
            break;
          }
        }
        return;
      }

      let minusBtn = e.target.closest('.cart-qty-minus');
      if (minusBtn) {
        e.preventDefault();
        let control = minusBtn.closest('.cart-qty-control');
        if (!control) return;

        let id = control.getAttribute('data-id');
        let title = control.getAttribute('data-title');
        let items = window.BirmarketCart ? window.BirmarketCart.get() : [];

        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if ((id && String(item.id) === String(id)) || (title && item.title === title)) {
            let currentCount = parseInt(item.count) || 1;
            if (currentCount > 1) {
              window.BirmarketCart.updateQuantity(item.id, item.title, currentCount - 1);
              renderCart();
            }
            break;
          }
        }
        return;
      }

      let removeBtn = e.target.closest('.cart-item-remove-btn');
      if (removeBtn) {
        e.preventDefault();
        let id = removeBtn.getAttribute('data-id');
        let title = removeBtn.getAttribute('data-title');
        if (window.BirmarketCart) {
          window.BirmarketCart.remove(id, title);
        }
        renderCart();
      }
    });
  }

  window.addEventListener('birmarket-cart-change', renderCart);
  window.addEventListener('storage', function (e) {
    if (e.key === 'birmarket_cart') {
      renderCart();
    }
  });

  renderCart();
});
