function initTrendingTags() {
  let container = document.getElementById('trendingTagsList');
  if (!container) return;

  let tags = [
    "redmi note 17 pro max",
    "iPhone 16 Pro",
    "Xiaomi 18 pro max",
    "Kombi",
    "Iphone 18 pro max",
    "Iphone 18 pro",
    "Xiaomi 17",
    "Kondisionerlər",
    "Mega endirimlər",
    "Honor telefonları",
    "Poco X8 Pro",
    "Minoxidil",
    "Honor 600 pro",
    "Notbuklar",
    "Planşetlər",
    "Masaüstü kompüterlər",
    "iPhone 17",
    "Smartfonlar"
  ];

  let html = '';
  for (let i = 0; i < tags.length; i++) {
    html += '<a href="#" class="trending-tag-item">' + tags[i] + '</a>';
  }

  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initTrendingTags);
