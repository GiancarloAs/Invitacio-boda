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
     6) BOTÓN DE MÚSICA — YouTube IFrame Player (oculto)
     Implementación más robusta:
       - si la API aún no está lista, creamos un <iframe> con autoplay=1&mute=1
         (los navegadores permiten autoplay si está silenciado). Esto inicia
         la reproducción en "mute" inmediatamente.
       - cuando la API esté lista creamos un YT.Player para poder controlar
         play/pause/unmute en clicks posteriores (unmute debe hacerse en respuesta
         a una interacción del usuario, por eso lo hacemos dentro del click).
  ===================================================================== */
  // 🎵 ID del video de YouTube (de la URL: youtube.com/watch?v=ESTE_ID)
  const YT_VIDEO_ID = 'csG0LDsh2Xg';

  const musicBtn = document.getElementById('music-toggle');
  const musicLabelEm = musicBtn.querySelector('em');
  let ytPlayer = null;
  let createdIframe = false; // si creamos el iframe autoplay-muted como fallback
  let mutedAutoplay = false; // indica que el iframe está reproduciendo en mute

  function createIframeAutoplayMuted(){
    const container = document.getElementById('yt-player');
    if (!container) return;
    // Si ya hay contenido, límpialo antes
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${YT_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${YT_VIDEO_ID}&enablejsapi=1&playsinline=1&rel=0`;
    iframe.width = '1'; iframe.height = '1';
    iframe.setAttribute('allow', 'autoplay; encrypted-media;');
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.position = 'absolute';
    iframe.style.pointerEvents = 'none';
    container.appendChild(iframe);
    createdIframe = true;
    mutedAutoplay = true;
  }

  // La API de YouTube sigue cargándose de forma normal
  window.onYouTubeIframeAPIReady = function(){
    try{
      ytPlayer = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: YT_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: YT_VIDEO_ID,
          playsinline: 1
        },
        events: {
          onReady: () => {
            // Si ya habíamos iniciado la reproducción en mute con el iframe,
            // intentamos sincronizar el player: reproducir y mantener mute.
            if (mutedAutoplay && ytPlayer){
              try{ ytPlayer.playVideo(); ytPlayer.mute(); }catch(e){ /* no crítico */ }
            }
          }
        }
      });
    }catch(e){
      // si algo falla, no bloqueamos la página
      console.warn('YT player init error', e);
    }
  };

  musicBtn.addEventListener('click', () => {
    // 1) no hay player (API no lista) y no hay iframe fallback: crear iframe autoplay muted
    if (!ytPlayer && !createdIframe){
      createIframeAutoplayMuted();
      musicBtn.classList.add('is-playing');
      musicLabelEm.textContent = 'Pausar';
      return;
    }

    // 2) no hay player pero sí el iframe fallback (API aún pendiente): alternar removiendo/creando iframe
    if (!ytPlayer && createdIframe){
      const container = document.getElementById('yt-player');
      if (musicBtn.classList.contains('is-playing')){
        // detener -> quitar iframe
        container.innerHTML = '';
        createdIframe = false; mutedAutoplay = false;
        musicBtn.classList.remove('is-playing');
        musicLabelEm.textContent = 'Activar';
      } else {
        // iniciar -> volver a crear iframe
        createIframeAutoplayMuted();
        musicBtn.classList.add('is-playing');
        musicLabelEm.textContent = 'Pausar';
      }
      return;
    }

    // 3) si el player existe, usamos la API para alternar play/pause y desmutear en interacción
    if (ytPlayer){
      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING){
        ytPlayer.pauseVideo();
        musicBtn.classList.remove('is-playing');
        musicLabelEm.textContent = 'Activar';
      } else {
        // En respuesta a la interacción del usuario podemos desmutear
        try{ ytPlayer.unMute(); }catch(e){}
        ytPlayer.playVideo();
        musicBtn.classList.add('is-playing');
        musicLabelEm.textContent = 'Pausar';
      }
    }
  });

  /* =====================================================================
     7) PÉTALOS FLOTANTES (decoración ambiental) — mayor visibilidad
     ===================================================================== */
  function spawnPetals(container, count){
    if (!container) return;
    for (let i = 0; i < count; i++){
      const petal = document.createElement('span');
      petal.className = 'petal';
      // arrancan por encima del viewport del contenedor
      const left = Math.random() * 100;
      const duration = 7 + Math.random() * 9; // algo más rápidos
      const delay = Math.random() * 8;
      const size = 10 + Math.random() * 16; // un poco más grandes
      const top = -8 - Math.random() * 12; // más arriba
      const opacity = 0.6 + Math.random() * 0.35;

      petal.style.left = `${left}%`;
      petal.style.top = `${top}%`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      petal.style.opacity = String(opacity);
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;
      petal.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(petal);
    }
  }

  document.querySelectorAll('.petals-layer').forEach(layer => {
    const isSparse = layer.classList.contains('petals-layer--sparse');
    // aumentar conteo para que se vean claramente
    spawnPetals(layer, isSparse ? 10 : 18);
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
