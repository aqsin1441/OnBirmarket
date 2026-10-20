function initActualCategories() {
  let grid = document.getElementById('actualGrid');
  if (!grid) return;

  let actualCategories = [
    {
      id: 1,
      title: "Telefonlar, Smart cihazlar və telefon aksessuarları",
      image: "img/telefon.webp",
      link: "#"
    },
    {
      id: 2,
      title: "Notbuk və kompüterlər",
      image: "img/notbuk.webp",
      link: "#"
    },
    {
      id: 3,
      title: "Məişət texnikası",
      image: "img/meiset.webp",
      link: "#"
    },
    {
      id: 4,
      title: "TV, audio və video",
      image: "img/playstation_37852.webp",
      link: "#"
    },
    {
      id: 5,
      title: "Gözəllik",
      image: "img/etir.webp",
      link: "#"
    },
    {
      id: 6,
      title: "Bağ üçün məhsullar",
      image: "img/bag.webp",
      link: "#"
    }
  ];

  let html = '';
  for (let i = 0; i < actualCategories.length; i++) {
    let item = actualCategories[i];
    html += `
      <a href="${item.link}" class="actual-card">
        <div class="actual-card-img-wrap">
          <img src="${item.image}" alt="${item.title}" class="actual-card-img" loading="lazy">
        </div>
        <span class="actual-card-title">${item.title}</span>
      </a>
    `;
  }

  grid.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initActualCategories);
