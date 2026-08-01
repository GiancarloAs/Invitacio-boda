document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================================
     1) EL LIBRO — 4 estados: closed -> hover -> click1 -> open
     ===================================================================== */
  const book = document.getElementById('book');
  const bookScreen = document.getElementById('book-screen');
  const invitation = document.getElementById('invitation');
  const openBtn = document.getElementById('open-invite-btn');
  const openLabel = document.getElementById('open-invite-label');

  let bookState = 'closed'; // closed -> hover -> click1 -> open

  function setBookState(state){
    bookState = state;
    book.classList.remove('book--closed', 'book--hover', 'book--click1', 'book--open');
    book.classList.add(`book--${state}`);
  }

  // Al pasar el mouse: closed -> hover (solo si aún no se ha hecho click)
  book.addEventListener('mouseenter', () => {
    if (bookState === 'closed') setBookState('hover');
  });
  book.addEventListener('mouseleave', () => {
    if (bookState === 'hover') setBookState('closed');
  });

  // Al hacer click: hover/closed -> click1 (entreabierto) -> open (abierto + texto)
  function advanceBook(){
    if (bookState === 'closed' || bookState === 'hover'){
      setBookState('click1');
      openLabel.textContent = 'Seguir abriendo';
    } else if (bookState === 'click1'){
      setBookState('open');
      openLabel.textContent = 'Entrar a la invitación';
      revealBookText();
    } else if (bookState === 'open'){
      revealInvitation();
    }
  }

  book.addEventListener('click', advanceBook);
  openBtn.addEventListener('click', advanceBook);

  function revealInvitation(){
    bookScreen.classList.add('is-hidden');
    invitation.removeAttribute('aria-hidden');
    document.body.style.overflow = 'auto';
    // Dispara animación de letras y reveal del hero al entrar
    setTimeout(() => {
      animateHeroLetters();
      revealOnScroll();
    }, 300);
  }

  // Mientras el libro está en pantalla, bloquear scroll del body
  document.body.style.overflow = 'hidden';

  /* =====================================================================
     2) ANIMACIÓN LETRA POR LETRA — nombres del hero
     ===================================================================== */
  function animateHeroLetters(){
    document.querySelectorAll('.letters').forEach(el => {
      if (el.dataset.done) return;
      const text = el.dataset.text || el.textContent;
      el.textContent = '';
      [...text].forEach((ch, i) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.animationDelay = `${i * 0.06}s`;
        el.appendChild(span);
      });
      el.dataset.done = 'true';
    });
  }

  /* =====================================================================
     2b) ESCRITURA CON DIFUMINADO — texto del libro (página final)
     Cada letra nace borrosa y transparente, y se va "escribiendo" en
     cadena: primero el eyebrow, luego el título, luego los nombres.
     ===================================================================== */
  function typeWriteBlur(el, startDelay, step){
    const nodes = Array.from(el.childNodes);
    el.textContent = '';
    let i = 0;
    nodes.forEach(node => {
      if (node.nodeName === 'BR'){
        el.appendChild(document.createElement('br'));
        return;
      }
      const text = node.textContent;
      [...text].forEach(ch => {
        const span = document.createElement('span');
        span.className = 'blur-char';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        span.style.animationDelay = `${(startDelay + i * step).toFixed(3)}s`;
        el.appendChild(span);
        i++;
      });
    });
    return startDelay + i * step;
  }

  function revealBookText(){
    const eyebrow = document.querySelector('.book-text__eyebrow');
    const title = document.querySelector('.book-text__title');
    const names = document.querySelector('.book-text__names');
    if (!eyebrow || eyebrow.dataset.done) return;

    let cursor = 0.15; // pequeña espera tras abrirse el libro
    cursor = typeWriteBlur(eyebrow, cursor, 0.026) + 0.25;
    cursor = typeWriteBlur(title, cursor, 0.05) + 0.3;
    typeWriteBlur(names, cursor, 0.045);

    eyebrow.dataset.done = 'true';
  }

  /* =====================================================================
     3) REVEAL ON SCROLL — fade + up para .reveal-up
     ===================================================================== */
  const revealTargets = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  function revealOnScroll(){
    revealTargets.forEach(el => revealObserver.observe(el));
  }

  /* =====================================================================
     4) CUENTA REGRESIVA
     ===================================================================== */
  const countdownEl = document.getElementById('countdown');
  if (countdownEl){
    const eventDate = new Date(countdownEl.dataset.eventDate).getTime();
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    function pad(n){ return String(n).padStart(2, '0'); }

    function tickCountdown(){
      const now = Date.now();
      const diff = eventDate - now;

      if (diff <= 0){
        daysEl.textContent = '000';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        clearInterval(countdownInterval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      daysEl.textContent = String(days).padStart(3, '0');
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    }

    tickCountdown();
    const countdownInterval = setInterval(tickCountdown, 1000);
  }

  /* =====================================================================
     5) COPIAR DATOS DE CUENTA (mesa de regalos)
     ===================================================================== */
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const valueEl = btn.previousElementSibling;
      const text = valueEl?.dataset.copy || valueEl?.textContent || '';
      navigator.clipboard.writeText(text.trim()).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copiado ✓';
        btn.classList.add('is-copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('is-copied');
        }, 1800);
      });
    });
  });

  /* =====================================================================
     6) BOTÓN DE MÚSICA
     ===================================================================== */
  const music = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  const musicLabelEm = musicBtn.querySelector('em');

  musicBtn.addEventListener('click', () => {
    if (music.paused){
      music.play().catch(() => {
        // El navegador puede bloquear el autoplay hasta interacción; esto ya es interacción.
      });
      musicBtn.classList.add('is-playing');
      musicLabelEm.textContent = 'Pausar';
    } else {
      music.pause();
      musicBtn.classList.remove('is-playing');
      musicLabelEm.textContent = 'Activar';
    }
  });

  /* =====================================================================
     7) PÉTALOS FLOTANTES (decoración ambiental)
     ===================================================================== */
  function spawnPetals(container, count){
    if (!container) return;
    for (let i = 0; i < count; i++){
      const petal = document.createElement('span');
      petal.className = 'petal';
      const left = Math.random() * 100;
      const duration = 9 + Math.random() * 10;
      const delay = Math.random() * 10;
      const size = 8 + Math.random() * 10;
      const hue = Math.random() > 0.5 ? '' : 'filter: hue-rotate(20deg);';
      petal.style.left = `${left}%`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;
      petal.style.cssText += hue;
      container.appendChild(petal);
    }
  }

  document.querySelectorAll('.petals-layer').forEach(layer => {
    const isSparse = layer.classList.contains('petals-layer--sparse');
    spawnPetals(layer, isSparse ? 6 : 12);
  });

  /* =====================================================================
     8) RSVP — placeholders de links (rellenar después)
     ===================================================================== */
  // 👉 Cuando tengas el link del Google Form, reemplaza aquí:
  const RSVP_FORM_URL = ''; // ej: 'https://forms.gle/xxxxxxxx'
  const rsvpFormLink = document.getElementById('rsvp-form-link');
  if (RSVP_FORM_URL) rsvpFormLink.href = RSVP_FORM_URL;

  // 👉 Cuando tengas el número, reemplaza aquí (formato: 51XXXXXXXXX):
  const WHATSAPP_NUMBER = ''; // ej: '51987654321'
  const WHATSAPP_MESSAGE = 'Hola! Confirmo mi asistencia a la boda de Daniela y Rodrigo 💜';
  const rsvpWhatsappLink = document.getElementById('rsvp-whatsapp-link');
  if (WHATSAPP_NUMBER){
    rsvpWhatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  }

  // 👉 Cuando tengas los links de Google Maps, reemplaza aquí:
  const MAPS_LINKS = {
    ceremonia: '', // ej: 'https://maps.app.goo.gl/xxxxx'
    recepcion: ''
  };
  document.querySelectorAll('[data-maps-slot]').forEach(link => {
    const slot = link.dataset.mapsSlot;
    if (MAPS_LINKS[slot]) link.href = MAPS_LINKS[slot];
  });

});
