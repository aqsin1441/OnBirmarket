function isSameItem(item, id, title) {
  if (!item) return false;

  // ID match
  if (id && item.id && String(item.id) === String(id)) {
    return true;
  }

  // Exact title match
  if (title && item.title) {
    let t1 = item.title.toLowerCase().trim();
    let t2 = title.toLowerCase().trim();
    if (t1 === t2 || t1.indexOf(t2) !== -1 || t2.indexOf(t1) !== -1) {
      return true;
    }
  }

  return false;
}

window.BirmarketWishlist = {
  key: 'birmarket_wishlist',

  get: function () {
    let data = localStorage.getItem(this.key);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  save: function (items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    this.updateBadges();
    this.syncAllHearts();
    window.dispatchEvent(new CustomEvent('birmarket-wishlist-change'));
  },

  has: function (id, title) {
    let items = this.get();
    for (let i = 0; i < items.length; i++) {
      if (isSameItem(items[i], id, title)) {
        return true;
      }
    }
    return false;
  },

  toggle: function (product) {
    if (!product) return false;
    let items = this.get();
    let foundIndex = -1;

    for (let i = 0; i < items.length; i++) {
      if (isSameItem(items[i], product.id, product.title)) {
        foundIndex = i;
        break;
      }
    }

    let isAdded = false;
    if (foundIndex !== -1) {
      items.splice(foundIndex, 1);
      isAdded = false;
    } else {
      items.push({
        id: product.id,
        title: product.title || '',
        image: product.image || product.img || '',
        price: product.price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        installment: product.installment,
        rating: product.rating,
        reviewCount: product.reviewCount,
        delivery: product.delivery
      });
      isAdded = true;
    }

    this.save(items);
    return isAdded;
  },

  remove: function (id, title) {
    let items = this.get();
    let newItems = [];
    for (let i = 0; i < items.length; i++) {
      if (!isSameItem(items[i], id, title)) {
        newItems.push(items[i]);
      }
    }
    this.save(newItems);
  },

  updateBadges: function () {
    let count = this.get().length;
    let buttons = document.querySelectorAll('.wishlist-btn');

    for (let i = 0; i < buttons.length; i++) {
      let btn = buttons[i];
      let badge = btn.querySelector('.wishlist-badge');

      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'wishlist-badge';
          btn.appendChild(badge);
        }
        badge.textContent = count;
      } else if (badge) {
        badge.remove();
      }
    }
  },

  syncAllHearts: function () {
    let wishButtons = document.querySelectorAll('.deal-card-wishlist, .bestseller-card-wishlist, .novelty-card-wishlist');

    for (let i = 0; i < wishButtons.length; i++) {
      let btn = wishButtons[i];
      let card = btn.closest('.deal-card, .bestseller-card, .novelty-card');
      if (!card) continue;

      let id = card.getAttribute('data-id');
      let titleEl = card.querySelector('.deal-card-title, .bestseller-card-title, .novelty-card-title, h3');
      let title = titleEl ? titleEl.textContent.trim() : '';

      let isLiked = this.has(id, title);
      let svg = btn.querySelector('svg');

      if (isLiked) {
        btn.classList.add('active');
        if (svg) {
          svg.setAttribute('fill', '#ea207e');
          svg.setAttribute('stroke', '#ea207e');
        }
      } else {
        btn.classList.remove('active');
        if (svg) {
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
        }
      }
    }
  }
};

window.BirmarketCart = {
  key: 'birmarket_cart',

  get: function () {
    let data = localStorage.getItem(this.key);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  },

  save: function (items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    this.updateBadges();
    this.syncAllCartButtons();
    window.dispatchEvent(new CustomEvent('birmarket-cart-change'));
  },

  getCount: function () {
    let items = this.get();
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      let count = parseInt(items[i].count) || 1;
      total = total + count;
    }
    return total;
  },

  has: function (id, title) {
    let items = this.get();
    for (let i = 0; i < items.length; i++) {
      if (isSameItem(items[i], id, title)) {
        return true;
      }
    }
    return false;
  },

  add: function (product, qty) {
    if (!product) return;
    if (!qty) qty = 1;

    let items = this.get();
    let found = false;

    for (let i = 0; i < items.length; i++) {
      if (isSameItem(items[i], product.id, product.title)) {
        items[i].count = (parseInt(items[i].count) || 1) + qty;
        found = true;
        break;
      }
    }

    if (!found) {
      items.push({
        id: product.id,
        title: product.title || '',
        image: product.image || product.img || '',
        price: product.price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        installment: product.installment,
        delivery: product.delivery || '17 oktyabr',
        seller: product.seller || 'Cars Parts',
        count: qty
      });
    }

    this.save(items);
  },

  updateQuantity: function (id, title, newCount) {
    let items = this.get();
    let newItems = [];

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (isSameItem(item, id, title)) {
        if (newCount > 0) {
          item.count = newCount;
          newItems.push(item);
        }
      } else {
        newItems.push(item);
      }
    }

    this.save(newItems);
  },

  remove: function (id, title) {
    let items = this.get();
    let newItems = [];
    for (let i = 0; i < items.length; i++) {
      if (!isSameItem(items[i], id, title)) {
        newItems.push(items[i]);
      }
    }
    this.save(newItems);
  },

  updateBadges: function () {
    let total = this.getCount();
    let buttons = document.querySelectorAll('.cart-btn');

    for (let i = 0; i < buttons.length; i++) {
      let btn = buttons[i];
      let badge = btn.querySelector('.cart-badge');

      if (total > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'cart-badge';
          btn.appendChild(badge);
        }
        badge.textContent = total;
      } else if (badge) {
        badge.remove();
      }
    }
  },

  syncAllCartButtons: function () {
    let cartButtons = document.querySelectorAll('.deal-card-btn, .bestseller-card-btn, .novelty-card-btn, .wishlist-card-cart-btn');

    for (let i = 0; i < cartButtons.length; i++) {
      let btn = cartButtons[i];
      let card = btn.closest('.deal-card, .bestseller-card, .novelty-card, .wishlist-card-item');
      if (!card) continue;

      let id = card.getAttribute('data-id');
      let titleEl = card.querySelector('.deal-card-title, .bestseller-card-title, .novelty-card-title, .wishlist-card-title, h3');
      let title = titleEl ? titleEl.textContent.trim() : '';

      let inCart = this.has(id, title);
      let textSpan = btn.querySelector('span');

      if (inCart) {
        if (!btn.getAttribute('data-original-text') && textSpan && textSpan.textContent.trim() !== 'Səbətdə') {
          btn.setAttribute('data-original-text', textSpan.textContent.trim());
        }
        btn.classList.add('in-cart');
        if (textSpan) {
          textSpan.textContent = 'Səbətdə';
        }
      } else {
        btn.classList.remove('in-cart');
        if (textSpan && btn.hasAttribute('data-original-text')) {
          textSpan.textContent = btn.getAttribute('data-original-text');
        }
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  let burgerBtn = document.getElementById('burgerBtn');
  let siteHeader = document.getElementById('siteHeader');

  if (burgerBtn && siteHeader) {
    burgerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      siteHeader.classList.toggle('menu-open');
      document.body.classList.toggle('menu-open');
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && siteHeader.classList.contains('menu-open')) {
        siteHeader.classList.remove('menu-open');
        document.body.classList.remove('menu-open');
      }
    });
  }

  let footerTitleBtns = document.querySelectorAll('.footer-title-btn');
  for (let i = 0; i < footerTitleBtns.length; i++) {
    let btn = footerTitleBtns[i];
    btn.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
        let section = btn.closest('.footer-section');
        if (section) {
          section.classList.toggle('open');
        }
      }
    });
  }

  window.BirmarketWishlist.updateBadges();
  window.BirmarketWishlist.syncAllHearts();
  window.BirmarketCart.updateBadges();
  window.BirmarketCart.syncAllCartButtons();

  setTimeout(function () {
    window.BirmarketWishlist.syncAllHearts();
    window.BirmarketCart.syncAllCartButtons();
  }, 400);
});

window.addEventListener('storage', function (e) {
  if (e.key === 'birmarket_wishlist') {
    window.BirmarketWishlist.updateBadges();
    window.BirmarketWishlist.syncAllHearts();
  }
  if (e.key === 'birmarket_cart') {
    window.BirmarketCart.updateBadges();
    window.BirmarketCart.syncAllCartButtons();
  }
});

document.addEventListener('click', function (e) {
  let cartBtn = e.target.closest('.deal-card-btn, .bestseller-card-btn, .novelty-card-btn, .wishlist-card-cart-btn');
  if (cartBtn) {
    e.preventDefault();
    e.stopPropagation();

    let card = cartBtn.closest('.deal-card, .bestseller-card, .novelty-card, .wishlist-card-item');
    if (!card) return;

    let id = card.getAttribute('data-id');
    let titleEl = card.querySelector('.deal-card-title, .bestseller-card-title, .novelty-card-title, .wishlist-card-title, h3');
    let title = titleEl ? titleEl.textContent.trim() : '';

    if (window.BirmarketCart.has(id, title)) {
      window.location.href = 'sebet.htm';
      return;
    }

    let imgEl = card.querySelector('.deal-card-img, .bestseller-card-img, .novelty-card-img, .wishlist-card-img, img');
    let imgSrc = imgEl ? (imgEl.src || '') : '';

    let priceEl = card.querySelector('.deal-card-price, .bestseller-card-price, .novelty-card-price, .wishlist-card-price');
    let oldPriceEl = card.querySelector('.deal-card-old-price, .bestseller-card-old-price, .novelty-card-old-price, .wishlist-card-old-price');
    let discountEl = card.querySelector('.deal-card-discount, .bestseller-card-discount, .novelty-card-discount, .wishlist-card-discount');

    let price = priceEl ? parseFloat(priceEl.textContent.replace('₼', '').trim()) : 0;
    let oldPrice = oldPriceEl ? parseFloat(oldPriceEl.textContent.replace('₼', '').trim()) : null;
    let discount = discountEl ? parseInt(discountEl.textContent.replace(/[^0-9]/g, '')) : null;

    let productData = {
      id: id,
      title: title,
      image: imgSrc,
      price: price,
      oldPrice: oldPrice,
      discount: discount,
      installment: { monthly: 5.11, months: 24 },
      delivery: '17 oktyabr',
      seller: 'Cars Parts'
    };

    window.BirmarketCart.add(productData, 1);
    return;
  }

  let wishBtn = e.target.closest('.deal-card-wishlist, .bestseller-card-wishlist, .novelty-card-wishlist');
  if (wishBtn) {
    e.preventDefault();
    e.stopPropagation();

    let card = wishBtn.closest('.deal-card, .bestseller-card, .novelty-card');
    if (!card) return;

    let id = card.getAttribute('data-id');
    let titleEl = card.querySelector('.deal-card-title, .bestseller-card-title, .novelty-card-title, h3');
    let title = titleEl ? titleEl.textContent.trim() : '';

    let imgEl = card.querySelector('.deal-card-img, .bestseller-card-img, .novelty-card-img, img');
    let imgSrc = imgEl ? (imgEl.src || '') : '';

    let priceEl = card.querySelector('.deal-card-price, .bestseller-card-price, .novelty-card-price');
    let oldPriceEl = card.querySelector('.deal-card-old-price, .bestseller-card-old-price, .novelty-card-old-price');
    let discountEl = card.querySelector('.deal-card-discount, .bestseller-card-discount, .novelty-card-discount');

    let price = priceEl ? parseFloat(priceEl.textContent.replace('₼', '').trim()) : 0;
    let oldPrice = oldPriceEl ? parseFloat(oldPriceEl.textContent.replace('₼', '').trim()) : null;
    let discount = discountEl ? parseInt(discountEl.textContent.replace(/[^0-9]/g, '')) : null;

    let productData = {
      id: id,
      title: title,
      image: imgSrc,
      price: price,
      oldPrice: oldPrice,
      discount: discount,
      installment: { monthly: 5.11, months: 24 },
      rating: 5,
      reviewCount: 1
    };

    let isAdded = window.BirmarketWishlist.toggle(productData);
    let svg = wishBtn.querySelector('svg');

    if (isAdded) {
      wishBtn.classList.add('active');
      if (svg) {
        svg.setAttribute('fill', '#ea207e');
        svg.setAttribute('stroke', '#ea207e');
      }
    } else {
      wishBtn.classList.remove('active');
      if (svg) {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    }
    return;
  }

  // Məhsul kartına klikləyəndə details.htm səhifəsinə yönləndirmək
  let productCard = e.target.closest('.deal-card, .bestseller-card, .novelty-card');
  if (productCard) {
    let id = productCard.getAttribute('data-id') || '';
    let titleEl = productCard.querySelector('.deal-card-title, .bestseller-card-title, .novelty-card-title, h3');
    let title = titleEl ? titleEl.textContent.trim() : '';

    let imgEl = productCard.querySelector('.deal-card-img, .bestseller-card-img, .novelty-card-img, img');
    let imgSrc = imgEl ? (imgEl.src || '') : '';

    localStorage.setItem('birmarket_active_detail', JSON.stringify({
      id: id,
      title: title,
      image: imgSrc
    }));

    e.preventDefault();
    let url = 'details.htm?id=' + encodeURIComponent(id) + '&title=' + encodeURIComponent(title);
    window.location.href = url;
  }
});
