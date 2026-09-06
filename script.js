const voiceButton = document.querySelector('#voice-button');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const input = document.querySelector('#complaint-input');
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = 'en-IN';
  voiceButton.addEventListener('click', function() {
    recognition.start();
    voiceButton.textContent = 'Listening...';
  });

  recognition.onresult = function(event) {
    const text = event.results[0][0].transcript;
    input.value = `${input.value.trim()} ${text}`.trim();
    input.dispatchEvent(new Event('input'));
  };

  recognition.onend = function() {
    voiceButton.textContent = 'Voice Complaint';
  };
} else {
  voiceButton.disabled = true;
  voiceButton.textContent = 'Voice input unavailable';
}

const wordCount = document.querySelector('#word-count');
const progress = document.querySelector('.progress-line span');
const continueButton = document.querySelector('#continue-button');
const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('#nav-links');

function updateDraftProgress() {
  const words = input.value.trim() ? input.value.trim().split(/\s+/).length : 0;
  wordCount.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  progress.style.width = `${Math.min(35 + words * 2, 92)}%`;
}

input.addEventListener('input', updateDraftProgress);
continueButton.addEventListener('click', () => {
  continueButton.innerHTML = 'Looking good <span aria-hidden="true">&#10003;</span>';
  continueButton.style.background = '#18211d';
  continueButton.style.borderColor = '#18211d';
});
menuButton.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', isOpen);
  menuButton.textContent = isOpen ? 'Close' : 'Menu';
});

updateDraftProgress();
