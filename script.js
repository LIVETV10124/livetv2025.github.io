// Check if HLS.js is supported in the browser
function isHLSSupported() {
    return Hls.isSupported();
}

// Check if DASH.js is supported in the browser
function isDASHSupported() {
    return dashjs.MediaPlayerFactory.isSupported();
}

// Load the stream based on the type of stream (HLS, DASH, DRM)
function loadStream(streamUrl) {
    const videoElement = document.getElementById('live-video');

    // If HLS is supported, load using HLS.js
    if (isHLSSupported() && streamUrl.endsWith('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            videoElement.play();
        });
    } 
    // If DASH is supported, load using DASH.js
    else if (isDASHSupported() && streamUrl.endsWith('.mpd')) {
        const player = dashjs.MediaPlayerFactory.create();
        player.initialize(videoElement, streamUrl, true);
        videoElement.play();
    }
    // Otherwise, fall back to simple HTML5 video for non-supported formats
    else {
        videoElement.src = streamUrl;
        videoElement.play();
    }
}

// Event listener to load the default stream or show a message
document.addEventListener("DOMContentLoaded", () => {
    loadStream('http://example.com/live.m3u8'); // Replace with your default stream URL
});
