function initPromoSection() {
  let promoLinks = document.querySelectorAll('.promo-card');
  for (let i = 0; i < promoLinks.length; i++) {
    promoLinks[i].addEventListener('click', function (e) {
      e.preventDefault();
    });
  }
}

document.addEventListener('DOMContentLoaded', initPromoSection);
