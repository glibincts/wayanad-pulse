document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile Menu ── */
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('main-nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('nav-open');
      hamburger.classList.toggle('is-open');
      document.body.style.overflow = nav.classList.contains('nav-open') ? 'hidden' : '';
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Header Scroll Effect ── */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active Nav Section Detection ── */
  const sections  = document.querySelectorAll('section[id], main > section[id]');
  const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ── Scroll Reveal ── */
  const revealEls = document.querySelectorAll('.reveal, .animate-fade-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Animated Counters ── */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = Number.parseInt(el.dataset.target, 10);
      const duration = 2000;
      const step     = Math.ceil(target / (duration / 16));
      let current    = 0;

      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString();
        if (current < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ── Subscribe Form ── */
  const subscribeForm = document.getElementById('subscribeForm');
  const subMessage    = document.getElementById('subMessage');

  if (subscribeForm && subMessage) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = subscribeForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;

      btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Subscribing...';
      btn.disabled = true;

      setTimeout(() => {
        subMessage.textContent = '🎉 You\'re now subscribed to Wayanad Today!';
        subMessage.style.color = '#10b981';
        subscribeForm.reset();
        btn.innerHTML = originalHTML;
        btn.disabled  = false;
        setTimeout(() => { subMessage.textContent = ''; }, 5000);
      }, 1500);
    });
  }

  /* ── Live Weather (Open-Meteo) ── */
  const fetchWeather = async () => {
    const lat = 11.605, lon = 76.083;
    const tempEl     = document.getElementById('weather-temp');
    const descEl     = document.getElementById('weather-desc');
    const iconEl     = document.getElementById('weather-icon');
    const forecastEl = document.getElementById('forecastList');
    if (!tempEl) return;

    const weatherMap = {
      0:  { desc: 'Clear Sky',      icon: 'ri-sun-line' },
      1:  { desc: 'Mainly Clear',   icon: 'ri-sun-cloudy-line' },
      2:  { desc: 'Partly Cloudy',  icon: 'ri-cloudy-line' },
      3:  { desc: 'Overcast',       icon: 'ri-cloudy-fill' },
      45: { desc: 'Foggy',          icon: 'ri-mist-line' },
      48: { desc: 'Icy Fog',        icon: 'ri-mist-line' },
      51: { desc: 'Light Drizzle',  icon: 'ri-drizzle-line' },
      61: { desc: 'Slight Rain',    icon: 'ri-showers-line' },
      63: { desc: 'Moderate Rain',  icon: 'ri-heavy-showers-line' },
      65: { desc: 'Heavy Rain',     icon: 'ri-heavy-showers-line' },
      80: { desc: 'Rain Showers',   icon: 'ri-showers-line' },
      95: { desc: 'Thunderstorm',   icon: 'ri-thunderstorms-line' },
    };

    try {
      const res  = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await res.json();

      const code = data.current.weather_code;
      const info = weatherMap[code] || { desc: 'Clear', icon: 'ri-sun-cloudy-line' };

      tempEl.textContent = Math.round(data.current.temperature_2m);
      descEl.textContent = info.desc;
      iconEl.className   = `${info.icon} weather-icon-big`;

      if (forecastEl) {
        let forecastHTML = '';
        data.daily.time.slice(1, 6).forEach((date, i) => {
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
          const dc      = data.daily.weather_code[i + 1];
          const max     = Math.round(data.daily.temperature_2m_max[i + 1]);
          const min     = Math.round(data.daily.temperature_2m_min[i + 1]);
          const ico     = (weatherMap[dc] || { icon: 'ri-sun-cloudy-line' }).icon;

          forecastHTML += `
            <div class="forecast-day">
              <span>${dayName}</span>
              <i class="${ico}"></i>
              <span>${max}° / ${min}°</span>
            </div>`;
        });
        forecastEl.innerHTML = forecastHTML;
      }
    } catch (err) {
      console.error('Weather fetch failed:', err);
      if (descEl) descEl.textContent = 'Weather unavailable';
    }
  };

  fetchWeather();

  /* ── Back to Top ── */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

});
