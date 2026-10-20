function initAppPromoSection() {
  let downloadBtn = document.getElementById('appPromoDownloadBtn');
  let badgeLinks = document.querySelectorAll('.app-badge-link');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', function (e) {
      e.preventDefault();
      let firstStoreLink = document.querySelector('.app-badge-link');
      if (firstStoreLink) {
        firstStoreLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  for (let i = 0; i < badgeLinks.length; i++) {
    badgeLinks[i].addEventListener('click', function (e) {
    });
  }
}

document.addEventListener('DOMContentLoaded', initAppPromoSection);
