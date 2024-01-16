export function createAttr(container) {
  const img = document.createElement('img');
  img.src = '../assets/Spotify_Logo_RGB_Black.png';
  img.style =
    'position: absolute; bottom: 0.5rem; right: 0.5rem; z-index: 1000; width: 100px;';
  container.appendChild(img);
}
