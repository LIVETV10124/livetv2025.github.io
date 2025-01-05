// URL of the M3U playlist
const playlistUrl = "https://raw.githubusercontent.com/livetv2025/livetv2025.github.io/refs/heads/main/iptv.cache-8.m3u";

// Function to fetch and parse the M3U playlist
async function fetchPlaylist(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        return parseM3U(text);
    } catch (error) {
        console.error("Error fetching playlist:", error);
    }
}

// Function to parse M3U file content
function parseM3U(data) {
    const channels = [];
    const lines = data.split("\n");

    let currentChannel = {};
    lines.forEach((line) => {
        if (line.startsWith("#EXTINF")) {
            const match = line.match(/#EXTINF:-?\d+,(.+)/);
            currentChannel.name = match ? match[1].trim() : "Unknown Channel";

            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            currentChannel.logo = logoMatch ? logoMatch[1] : "https://via.placeholder.com/150";
        } else if (line.startsWith("http")) {
            currentChannel.url = line.trim();
            channels.push({ ...currentChannel });
            currentChannel = {};
        }
    });

    return channels;
}

// Function to load channels into the grid
function loadChannels(channels) {
    const gridContainer = document.getElementById("channel-grid");

    channels.forEach((channel) => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${channel.logo}" alt="${channel.name}" class="channel-logo">
            <div class="epg">
                <p><strong>${channel.name}</strong></p>
                <button onclick="playStream('${channel.url}')">Watch Now</button>
            </div>
        `;

        gridContainer.appendChild(card);
    });
}

// Function to play the selected stream
function playStream(url) {
    const videoPlayer = document.createElement("div");
    videoPlayer.className = "video-player-overlay";

    videoPlayer.innerHTML = `
        <div class="video-player">
            <video controls autoplay>
                <source src="${url}" type="application/x-mpegURL">
                Your browser does not support the video tag.
            </video>
            <button class="close-btn" onclick="closePlayer()">Close</button>
        </div>
    `;

    document.body.appendChild(videoPlayer);
}

// Function to close the video player
function closePlayer() {
    const player = document.querySelector(".video-player-overlay");
    if (player) {
        player.remove();
    }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", async () => {
    const channels = await fetchPlaylist(playlistUrl);
    loadChannels(channels);
});
