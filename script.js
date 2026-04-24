document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile Menu Logic ── */
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('main-nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('nav-open');
      hamburger.classList.toggle('is-open');
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('nav-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        nav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  /* ── Header Scroll Effect ── */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }
  }, { passive: true });

  /* ── Scroll Reveal Animation ── */
  const revealEls = document.querySelectorAll('.reveal, .animate-fade-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Animated Counters ── */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const step   = Math.ceil(target / (duration / 16));
      let current  = 0;
      
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

  /* ── Subscription Form Handling ── */
  const subscribeForm = document.getElementById('subscribeForm');
  const subMessage    = document.getElementById('subMessage');

  if (subscribeForm && subMessage) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = subscribeForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Subscribing...';
      btn.disabled = true;

      setTimeout(() => {
        subMessage.textContent = '🎉 Awesome! You\'re now subscribed to Wayanad Today.';
        subMessage.style.color = '#10b981';
        subscribeForm.reset();
        btn.innerHTML = originalText;
        btn.disabled  = false;
        setTimeout(() => { subMessage.textContent = ''; }, 5000);
      }, 1500);
    });
  }

  /* ── Live Weather API (Open-Meteo) ── */
  const fetchWeather = async () => {
    const lat = 11.605, lon = 76.083; // Wayanad Coordinates
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.getElementById('weather-icon');
    const forecastEl = document.getElementById('forecastList');

    if (!tempEl) return;

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
      const data = await response.json();

      // Update Current Weather
      tempEl.textContent = Math.round(data.current.temperature_2m);
      
      const weatherMap = {
        0: { desc: 'Clear Sky', icon: 'ri-sun-line' },
        1: { desc: 'Mainly Clear', icon: 'ri-sun-cloudy-line' },
        2: { desc: 'Partly Cloudy', icon: 'ri-cloudy-line' },
        3: { desc: 'Overcast', icon: 'ri-cloudy-fill' },
        45: { desc: 'Foggy', icon: 'ri-mist-line' },
        61: { desc: 'Slight Rain', icon: 'ri-showers-line' },
        95: { desc: 'Thunderstorm', icon: 'ri-thunderstorms-line' }
      };

      const currentCode = data.current.weather_code;
      descEl.textContent = weatherMap[currentCode]?.desc || 'Clear';
      iconEl.className = `${weatherMap[currentCode]?.icon || 'ri-sun-line'} weather-icon-big`;

      // Update 5-Day Forecast
      if (forecastEl) {
        forecastEl.innerHTML = '';
        data.daily.time.slice(1, 6).forEach((date, i) => {
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
          const code = data.daily.weather_code[i+1];
          const max = Math.round(data.daily.temperature_2m_max[i+1]);
          const min = Math.round(data.daily.temperature_2m_min[i+1]);
          
          forecastEl.innerHTML += `
            <div class="forecast-day">
              <span>${dayName}</span>
              <i class="${weatherMap[code]?.icon || 'ri-sun-cloudy-line'}"></i>
              <span>${max}° / ${min}°</span>
            </div>
          `;
        });
      }

    } catch (error) {
      console.error('Weather fetch failed:', error);
    }
  };

  fetchWeather();

  /* ── Back to Top Button ── */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
