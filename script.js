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
  let particleShown = false; // mostrar la explosión solo la primera vez

  function setBookState(state){
    bookState = state;
    book.classList.remove('book--closed', 'book--hover', 'book--click1', 'book--open');
    book.classList.add(`book--${state}`);

    // Si entramos en el estado entreabierto (click1) disparamos partículas
    if (state === 'click1' && !particleShown){
      spawnParticleExplosion(book, 44);
      particleShown = true;
    }
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
     6) BOTÓN DE MÚSICA — Audio HTML5 local (Music.mp3)
     Implementación simple para reproducción de archivo local
     ===================================================================== */
  const musicBtn = document.getElementById('music-toggle');
  const musicLabelEm = musicBtn.querySelector('em');
  const bgMusic = document.getElementById('bg-music');

  // Que la música se repita en bucle mientras el usuario navega la invitación
  bgMusic.loop = true;
  bgMusic.volume = 0.6;

  // Si el archivo no carga (nombre incorrecto, ruta equivocada, mayúsculas/minúsculas
  // no coinciden en el hosting, etc.) avisamos claramente en consola para depurar rápido.
  bgMusic.addEventListener('error', () => {
    console.error(
      'No se pudo cargar Music.mp3. Verifica que el archivo exista en la misma carpeta ' +
      'que index.html y que el nombre coincida EXACTAMENTE (mayúsculas/minúsculas incluidas), ' +
      'ya que GitHub Pages distingue entre mayúsculas y minúsculas en los nombres de archivo.'
    );
  });

  musicBtn.addEventListener('click', () => {
    if (bgMusic.paused){
      const playPromise = bgMusic.play();
      if (playPromise !== undefined){
        playPromise
          .then(() => {
            musicBtn.classList.add('is-playing');
            musicLabelEm.textContent = 'Pausar';
          })
          .catch(err => {
            console.warn('Error al reproducir audio:', err);
            musicBtn.classList.remove('is-playing');
            musicLabelEm.textContent = 'Activar';
          });
      }
    } else {
      bgMusic.pause();
      musicBtn.classList.remove('is-playing');
      musicLabelEm.textContent = 'Activar';
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
     8) EXPLOSIÓN DE PARTÍCULAS (estado click1 del libro)
     - Crea elementos .particle dentro de un wrapper .particle-explosion
     - Usa variables CSS --tx y --ty para mover cada partícula (keyframes en CSS)
     - Respeta prefers-reduced-motion
     ===================================================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function spawnParticleExplosion(parentEl, count = 20){
    if (prefersReducedMotion) return; // no animar si el usuario lo pidió
    if (!parentEl) return;

    const explosion = document.createElement('div');
    explosion.className = 'particle-explosion';
    // posicionamos la explosión en la mitad superior del libro (ajustable)
    explosion.style.left = '50%';
    explosion.style.top = '30%';
    explosion.style.transform = 'translate(-50%, -50%)';

    for (let i = 0; i < count; i++){
      const p = document.createElement('span');
      p.className = 'particle';
      // mayor variación de color, más cálida y dorada para que "brille" más
      const hue = 25 + Math.floor(Math.random() * 45); // 25-70
      p.style.background = `radial-gradient(circle at 35% 35%, #fff, hsl(${hue} 95% 75% / 1) 30%, hsl(${hue} 85% 58% / 1) 60%, transparent 100%)`;
      // origen en el centro del wrapper
      p.style.left = '0px';
      p.style.top = '0px';

      // aleatorizar dirección y una distancia mayor para un estallido más amplio
      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 260; // px (antes 40-140, ahora bastante más grande)
      const tx = Math.cos(angle) * distance + 'px';
      const ty = Math.sin(angle) * distance + 'px';
      p.style.setProperty('--tx', tx);
      p.style.setProperty('--ty', ty);

      // rotación aleatoria para que cada partícula gire al salir despedida
      const rotStart = Math.floor(Math.random() * 60) - 30;
      const rotEnd = rotStart + 220 + Math.random() * 260;
      p.style.setProperty('--rot', `${rotStart}deg`);
      p.style.setProperty('--rot-end', `${rotEnd}deg`);

      // partículas más grandes, con un pico de tamaño más marcado al salir
      const size = 10 + Math.random() * 12; // 10-22px
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      const peakScale = 1.3 + Math.random() * 0.9; // 1.3-2.2
      p.style.setProperty('--peak-scale', peakScale.toFixed(2));
      p.style.opacity = '0';
      // escalonar un poco los inicios para aspecto orgánico
      const delay = Math.random() * 200; // ms
      p.style.animationDelay = `${delay}ms`;

      explosion.appendChild(p);
    }

    parentEl.appendChild(explosion);

    // limpiar pasado el tiempo de la animación (1250ms + margen)
    setTimeout(() => {
      explosion.remove();
    }, 1700);
  }

  /* =====================================================================
     9) RSVP — placeholders de links (rellenar después)
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
    ceremonia: 'https://maps.app.goo.gl/QUQer9BckB35E4s37?g_st=iw', // Misa
    recepcion: 'https://maps.app.goo.gl/GaWg98tGVmDsBt7g9?g_st=iw' // Fiesta
  };
  document.querySelectorAll('[data-maps-slot]').forEach(link => {
    const slot = link.dataset.mapsSlot;
    if (MAPS_LINKS[slot]) link.href = MAPS_LINKS[slot];
  });

});
