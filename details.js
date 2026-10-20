// details.js - Birmarket Product Details Logic

document.addEventListener('DOMContentLoaded', function () {
  // 1. Data mənbəyindən bütün məhsulları toplamaq
  function getAllProducts() {
    let list = [];
    if (typeof discountedProducts !== 'undefined') {
      for (let i = 0; i < discountedProducts.length; i++) {
        list.push(discountedProducts[i]);
      }
    }
    if (typeof bestSellerProducts !== 'undefined') {
      for (let i = 0; i < bestSellerProducts.length; i++) {
        list.push(bestSellerProducts[i]);
      }
    }
    if (typeof newProducts !== 'undefined') {
      for (let i = 0; i < newProducts.length; i++) {
        list.push(newProducts[i]);
      }
    }
    return list;
  }

  // 2. Məlumatları URL və ya localStorage-dən əldə etmək
  let storedProduct = null;
  let savedData = localStorage.getItem('birmarket_active_detail');
  if (savedData) {
    try {
      storedProduct = JSON.parse(savedData);
    } catch (e) {}
  }

  let urlParams = new URLSearchParams(window.location.search);
  let targetId = urlParams.get('id') || (storedProduct ? storedProduct.id : null);
  let targetTitle = urlParams.get('title') || (storedProduct ? storedProduct.title : null);

  let allProducts = getAllProducts();
  let foundProduct = null;

  for (let i = 0; i < allProducts.length; i++) {
    let p = allProducts[i];
    if (targetId && String(p.id) === String(targetId)) {
      foundProduct = p;
      break;
    }
    if (targetTitle && p.title && p.title.indexOf(targetTitle) !== -1) {
      foundProduct = p;
      break;
    }
  }

  // Standart default məhsul (şəkildəki "Səyahət və ev üçün şişmə döşək")
  const defaultProduct = {
    id: 3,
    title: "Səyahət və ev üçün şişmə döşək BM-10202, 199x156x22 sm",
    image: "https://images.unsplash.com/photo-1722356541555-eeabc38f80a8?w=500&q=80",
    category: "Səyahət və istirahət",
    price: 99.69,
    oldPrice: 200.0,
    discount: 50,
    installment: { monthly: 5.11, months: 24 },
    rating: 5,
    reviewCount: 1,
    sku: "2325835"
  };

  let currentProduct = foundProduct || storedProduct || defaultProduct;
  let productImage = currentProduct.image || currentProduct.img || (storedProduct ? storedProduct.image : null) || defaultProduct.image;
  let displayTitle = currentProduct.fullTitle || currentProduct.title || defaultProduct.title;

  // 3. UI Elementləri
  let pageTitleEl = document.getElementById('pageTitle');
  let mainImgEl = document.getElementById('productMainImage');
  let titleEl = document.getElementById('productTitle');
  let starsEl = document.getElementById('productStars');
  let ratingNumEl = document.getElementById('productRatingNum');
  let reviewCountEl = document.getElementById('productReviewCount');
  let skuEl = document.getElementById('productSku');
  let wishlistBtnEl = document.getElementById('detailsWishlistBtn');

  // Specs
  let specBrandEl = document.getElementById('specBrand');
  let specTypeEl = document.getElementById('specType');
  let specDim1Label = document.getElementById('specDim1Label');
  let specDim1Value = document.getElementById('specDim1Value');
  let specDim2Label = document.getElementById('specDim2Label');
  let specDim2Value = document.getElementById('specDim2Value');

  // Action / Buy box
  let campaignTimerBarEl = document.getElementById('campaignTimerBar');
  let campaignTimerValueEl = document.getElementById('campaignTimerValue');
  let priceEl = document.getElementById('productPrice');
  let oldPriceGroupEl = document.getElementById('oldPriceGroup');
  let oldPriceEl = document.getElementById('productOldPrice');
  let discountBadgeEl = document.getElementById('productDiscountBadge');
  let installmentYellowTextEl = document.getElementById('installmentYellowText');
  let creditMonthsBtns = document.querySelectorAll('.credit-month-btn');
  let addToCartBtnEl = document.getElementById('detailsAddToCartBtn');
  let toastEl = document.getElementById('detailsToast');
  let toastMsgEl = document.getElementById('toastMessage');

  // 4. Qiymət formatlaşdırma funksiyası
  function formatMoney(num) {
    let val = parseFloat(num);
    if (isNaN(val)) return '0.00';
    return val.toFixed(2);
  }

  // 5. Toast göstərmək
  let toastTimeout = null;
  function showToast(message) {
    if (!toastEl) return;
    if (toastMsgEl) {
      toastMsgEl.textContent = message;
    }
    toastEl.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2500);
  }

  // 6. Məhsul məlumatlarını DOM-a yazmaq
  if (pageTitleEl) pageTitleEl.textContent = displayTitle + ' – Birmarket';
  if (titleEl) titleEl.textContent = displayTitle;

  // Şəkli təyin etmək və xəta halında ehtiyat şəkil qoymaq
  if (mainImgEl) {
    mainImgEl.src = productImage;
    mainImgEl.alt = displayTitle;
    mainImgEl.onerror = function () {
      if (displayTitle.toLowerCase().indexOf('iphone') !== -1) {
        this.src = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&q=80";
      } else {
        this.src = defaultProduct.image;
      }
    };
  }

  // Reytinq və rəylər
  let rating = parseInt(currentProduct.rating) || 5;
  let reviewCount = currentProduct.reviewCount || 1;

  if (starsEl) {
    starsEl.textContent = rating < 5 ? '★★★★☆' : '★★★★★';
  }
  if (ratingNumEl) {
    ratingNumEl.textContent = rating;
  }
  if (reviewCountEl) {
    reviewCountEl.textContent = reviewCount + ' rəy';
  }

  // SKU (Məhsul kodu)
  let skuCode = currentProduct.sku || ('232' + (currentProduct.id || '101'));
  if (skuEl) {
    skuEl.textContent = skuCode;
  }

  // Xüsusiyyətlər (Specs)
  if (specBrandEl) {
    let titleLower = displayTitle.toLowerCase();
    if (titleLower.indexOf('apple') !== -1 || titleLower.indexOf('iphone') !== -1) {
      specBrandEl.textContent = "Apple";
    } else {
      specBrandEl.textContent = currentProduct.brand || "Birmarket";
    }
  }
  if (specTypeEl) {
    specTypeEl.textContent = currentProduct.category || "Məhsul";
  }

  if (specDim1Label && specDim1Value) {
    specDim1Label.textContent = "Zəmanət:";
    specDim1Value.textContent = "12 ay rəsmi";
  }
  if (specDim2Label && specDim2Value) {
    specDim2Label.textContent = "Çatdırılma:";
    specDim2Value.textContent = currentProduct.delivery || "Sabah";
  }

  // Qiymət və Kampaniya
  let priceNum = parseFloat(currentProduct.price) || 0;
  let oldPriceNum = parseFloat(currentProduct.oldPrice) || 0;
  let discountVal = currentProduct.discount;

  if (!discountVal && oldPriceNum > priceNum) {
    discountVal = Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100);
  }

  if (priceEl) {
    priceEl.textContent = formatMoney(priceNum);
  }

  if (oldPriceNum > priceNum) {
    if (campaignTimerBarEl) campaignTimerBarEl.style.display = 'block';
    if (oldPriceGroupEl) oldPriceGroupEl.style.display = 'inline-flex';
    if (oldPriceEl) oldPriceEl.textContent = formatMoney(oldPriceNum) + ' ₼';
    if (discountBadgeEl && discountVal) {
      discountBadgeEl.textContent = '-' + discountVal + '%';
      discountBadgeEl.style.display = 'inline-block';
    }
    if (priceEl) priceEl.classList.add('has-discount');
  } else {
    if (campaignTimerBarEl) campaignTimerBarEl.style.display = 'none';
    if (oldPriceGroupEl) oldPriceGroupEl.style.display = 'none';
    if (priceEl) priceEl.classList.remove('has-discount');
  }

  // Geri sayım taymeri
  let timerSeconds = 14 * 3600 + 34 * 60 + 48;
  function updateCountdown() {
    if (timerSeconds > 0) {
      timerSeconds--;
    }
    let h = Math.floor(timerSeconds / 3600);
    let m = Math.floor((timerSeconds % 3600) / 60);
    let s = timerSeconds % 60;

    let hStr = h < 10 ? '0' + h : h;
    let mStr = m < 10 ? '0' + m : m;
    let sStr = s < 10 ? '0' + s : s;

    if (campaignTimerValueEl) {
      campaignTimerValueEl.textContent = hStr + ':' + mStr + ':' + sStr;
    }
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // Sarı Taksit Qutusu: Bütün məhsullarda dəyişməz eyni statik qiymət
  if (installmentYellowTextEl) {
    installmentYellowTextEl.textContent = '5.11 ₼ x 24 ay';
  }

  // Kredit kalkulyatoru: ayların button olaraq seçilməsi (vizual seçim)
  for (let i = 0; i < creditMonthsBtns.length; i++) {
    let btn = creditMonthsBtns[i];
    btn.addEventListener('click', function () {
      for (let j = 0; j < creditMonthsBtns.length; j++) {
        creditMonthsBtns[j].classList.remove('active');
      }
      btn.classList.add('active');
    });
  }

  // 7. Seçilmişlərə əlavə et funksionallığı
  function syncWishlistButton() {
    if (!wishlistBtnEl || !window.BirmarketWishlist) return;
    let isLiked = window.BirmarketWishlist.has(currentProduct.id, displayTitle);
    let svg = wishlistBtnEl.querySelector('svg');

    if (isLiked) {
      wishlistBtnEl.classList.add('active');
      if (svg) {
        svg.setAttribute('fill', '#ea207e');
        svg.setAttribute('stroke', '#ea207e');
      }
    } else {
      wishlistBtnEl.classList.remove('active');
      if (svg) {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    }
  }

  syncWishlistButton();

  if (wishlistBtnEl) {
    wishlistBtnEl.addEventListener('click', function () {
      if (!window.BirmarketWishlist) return;
      let isAdded = window.BirmarketWishlist.toggle({
        id: currentProduct.id,
        title: displayTitle,
        image: productImage,
        price: priceNum,
        oldPrice: oldPriceNum,
        discount: discountVal,
        installment: { monthly: 5.11, months: 24 },
        rating: rating,
        reviewCount: reviewCount
      });
      syncWishlistButton();
      showToast(isAdded ? "Məhsul seçilmişlərə əlavə olundu" : "Məhsul seçilmişlərdən silindi");
    });
  }

  // 8. Səbətə əlavə et funksionallığı
  function syncCartButton() {
    if (!addToCartBtnEl || !window.BirmarketCart) return;
    let inCart = window.BirmarketCart.has(currentProduct.id, displayTitle);

    if (inCart) {
      addToCartBtnEl.classList.add('in-cart');
      addToCartBtnEl.textContent = 'Səbətdədir';
    } else {
      addToCartBtnEl.classList.remove('in-cart');
      addToCartBtnEl.textContent = 'Səbətə əlavə etmək';
    }
  }

  syncCartButton();

  if (addToCartBtnEl) {
    addToCartBtnEl.addEventListener('click', function () {
      if (!window.BirmarketCart) return;

      if (window.BirmarketCart.has(currentProduct.id, displayTitle)) {
        window.location.href = 'sebet.htm';
        return;
      }

      window.BirmarketCart.add({
        id: currentProduct.id,
        title: displayTitle,
        image: productImage,
        price: priceNum,
        oldPrice: oldPriceNum,
        discount: discountVal,
        installment: { monthly: 5.11, months: 24 },
        delivery: '17 oktyabr',
        seller: 'Birmarket'
      }, 1);

      syncCartButton();
      showToast("Məhsul səbətə əlavə olundu");
    });
  }

  // Qlobal sinxronizasiya hadisələri
  window.addEventListener('birmarket-wishlist-change', syncWishlistButton);
  window.addEventListener('birmarket-cart-change', syncCartButton);
});
