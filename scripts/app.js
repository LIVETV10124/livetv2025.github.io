const m3uUrl = "https://raw.githubusercontent.com/MohammadKobirShah/KobirIPTV/refs/heads/main/KobirIPTV.m3u"; // Replace with your M3U link

const gridContainer = document.querySelector('.grid-container');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const playerModal = document.getElementById('player-modal');
const shakaPlayer = document.getElementById('shaka-player');
const closePlayerBtn = document.getElementById('close-player');

let allChannels = [];

// Load channels on page load
window.onload = async function () {
  await loadChannels();
  initSearchAndCategory();
};

// Parse and load M3U channels
async function loadChannels() {
  try {
    const response = await fetch(m3uUrl);
    const text = await response.text();
    allChannels = parseM3U(text);
    renderChannels(allChannels);
    populateCategories(allChannels);
  } catch (error) {
    console.error('Error loading M3U file:', error);
  }
}

// Parse M3U file
function parseM3U(m3uText) {
  const lines = m3uText.split('\n');
  const channels = [];
  let channel = {};

  lines.forEach((line) => {
    if (line.startsWith('#EXTINF')) {
      const info = line.match(/#EXTINF:.*?,(.*)/);
      const group = line.match(/group-title="([^"]+)"/);
      channel.name = info[1];
      channel.group = group ? group[1] : 'Uncategorized';
    } else if (line.startsWith('http')) {
      channel.url = line;
      channels.push(channel);
      channel = {};
    }
  });

  return channels;
}

// Render channels
function renderChannels(channels) {
  gridContainer.innerHTML = '';

  channels.forEach((channel) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="https://via.placeholder.com/150?text=${channel.name}" alt="${channel.name}">
      <p class="card-title">${channel.name}</p>
    `;
    card.addEventListener('click', () => playChannel(channel.url));
    gridContainer.appendChild(card);
  });
}

// Populate category dropdown
function populateCategories(channels) {
  const categories = new Set(channels.map((channel) => channel.group));
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

// Play channel using Shaka Player
function playChannel(url) {
  shakaPlayer.src = url;

  shakaPlayer.addEventListener('error', (event) => {
    console.error('Shaka Player Error:', event.detail);
  });

  if (shaka.Player.isBrowserSupported()) {
    const player = new shaka.Player(shakaPlayer);
    player.load(url).catch((error) => console.error('Error loading channel:', error));
  } else {
    alert('Shaka Player is not supported on this browser.');
  }

  playerModal.style.display = 'flex';
}

// Close player
closePlayerBtn.addEventListener('click', () => {
  shakaPlayer.pause();
  playerModal.style.display = 'none';
});

// Search and category filter
function initSearchAndCategory() {
  searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.toLowerCase();
    const filteredChannels = allChannels.filter((channel) =>
      channel.name.toLowerCase().includes(searchText)
    );
    renderChannels(filteredChannels);
  });

  categorySelect.addEventListener('change', () => {
    const selectedCategory = categorySelect.value;
    const filteredChannels =
      selectedCategory === 'all'
        ? allChannels
        : allChannels.filter((channel) => channel.group === selectedCategory);
    renderChannels(filteredChannels);
  });
}
