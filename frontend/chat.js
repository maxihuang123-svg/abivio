// abivio chat widget
(function () {
  const API_BASE = window.location.origin.includes('localhost') ? '' : '';

  // DOM refs
  const chatWidget = document.getElementById('chat-widget');
  const chatToggle = document.getElementById('chat-toggle');
  const chatClose = document.getElementById('chat-close');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  // Local chat state (no server-side session stored)
  let messages = [];
  let isLoading = false;
  let consent = localStorage.getItem('abivio_chat_consent') === 'true';
  let consentAsked = localStorage.getItem('abivio_chat_consent') !== null;

  // Initialize
  if (!chatWidget || !chatToggle || !chatClose || !chatForm || !chatInput || !chatMessages) {
    console.warn('Chat widget elements not found');
    return;
  }

  chatToggle.addEventListener('click', openChat);
  chatClose.addEventListener('click', closeChat);
  chatForm.addEventListener('submit', handleSubmit);

  function renderConsentBanner() {
    if (consentAsked) return;

    const banner = document.createElement('div');
    banner.className = 'chat-consent';
    banner.innerHTML = `
      <p>Deine Frage anonym zur Verbesserung speichern?</p>
      <div class="chat-consent-actions">
        <button type="button" class="chat-consent-btn chat-consent-yes">Ja</button>
        <button type="button" class="chat-consent-btn chat-consent-no">Nein</button>
      </div>
    `;

    banner.querySelector('.chat-consent-yes').addEventListener('click', () => {
      consent = true;
      consentAsked = true;
      localStorage.setItem('abivio_chat_consent', 'true');
      banner.remove();
      chatInput.focus();
    });

    banner.querySelector('.chat-consent-no').addEventListener('click', () => {
      consent = false;
      consentAsked = true;
      localStorage.setItem('abivio_chat_consent', 'false');
      banner.remove();
      chatInput.focus();
    });

    chatMessages.appendChild(banner);
    scrollToBottom();
  }

  function openChat() {
    chatWidget.hidden = false;
    chatToggle.hidden = true;
    renderConsentBanner();
    chatInput.focus();
  }

  function closeChat() {
    chatWidget.hidden = true;
    chatToggle.hidden = false;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;

    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    addMessage(text, 'user');
    messages.push({ role: 'user', content: text });

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, consent }),
      });

      const data = await res.json();

      if (res.ok && data.response) {
        addMessage(data.response, 'bot');
        messages.push({ role: 'assistant', content: data.response });

        // Keep only the last 5 messages to stay aligned with server-side limit
        if (messages.length > 5) {
          messages = messages.slice(-5);
        }
      } else {
        addMessage(data.error || 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuche es erneut.', 'bot');
      }
    } catch (err) {
      console.error('Chat error', err);
      addMessage('Keine Verbindung zum Berater. Bitte prüfe dein Netzwerk.', 'bot');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function addMessage(text, sender) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message-${sender}`;

    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    messageEl.appendChild(paragraph);

    chatMessages.appendChild(messageEl);
    scrollToBottom();
  }

  function setLoading(loading) {
    isLoading = loading;
    chatInput.disabled = loading;

    if (loading) {
      const typingEl = document.createElement('div');
      typingEl.id = 'chat-typing';
      typingEl.className = 'chat-message chat-message-bot chat-typing';
      typingEl.innerHTML = '<span></span><span></span><span></span>';
      chatMessages.appendChild(typingEl);
    } else {
      const typingEl = document.getElementById('chat-typing');
      if (typingEl) typingEl.remove();
    }

    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
})();
