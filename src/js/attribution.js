export function createAttr(container) {
  const img = document.createElement('img');
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    // dark mode
    img.src = '../assets/Spotify_Logo_RGB_White.png';
  } else {
    img.src = '../assets/Spotify_Logo_RGB_Black.png';
  }
  img.style =
    'position: fixed; bottom: 0.5rem; right: 0.5rem; z-index: 1000; width: 100px;';
  container.appendChild(img);
}
