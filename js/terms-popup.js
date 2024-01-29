import '../styles/variables.css';
import '../styles/popup.css';

export function createTermsPopup(div_container) {
  if (localStorage.getItem('terms-agreed')) {
    return;
  }

  const container = document.createElement('div');
  container.className = 'terms-popup';
  container.innerHTML = `
    <h2>This app is a third party app and is not affiliated with Spotify.</h2>
    <p class="terms-popup__content">
    By using this app, you consent to the use of cookies and local storage, and you agree not to share sensitive data saved in the URL. For more information, see our <a href="https://www.spotify.com/legal/cookies-policy/" target="_blank">Cookie Policy</a>.
    </p>
    <div class="terms-popup__button_container">
    <button class="terms-popup__button" id="popup-agree">I agree</button>
    <button class="terms-popup__button terms-popup__button--secondary">I disagree</button>
    </div>
    <a class="terms-popup__link" href="./terms-and-conditions/index.html" target="_blank">Full Terms and Conditions</a>
    `;
  container.classList.add('terms-popup');

  div_container.appendChild(container);

  document.getElementById('popup-agree').addEventListener('click', () => {
    container.style.display = 'none';
    localStorage.setItem('terms-agreed', true);
  });
}
