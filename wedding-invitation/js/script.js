document.addEventListener('DOMContentLoaded', () => {
  console.log('Wedding invitation loaded successfully.');

  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const countdownElement = document.querySelector('[data-countdown]');

  if (countdownElement) {
    const targetDate = new Date(countdownElement.dataset.countdown);

    if (!Number.isNaN(targetDate.getTime())) {
      const updateCountdown = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0) {
          countdownElement.textContent = 'We are celebrating now';
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);

        countdownElement.textContent = `${days}d ${hours}h ${minutes}m`;
      };

      updateCountdown();
      setInterval(updateCountdown, 60000);
    }
  }

  const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');

  whatsappLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.includes('[RSVP')) {
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (event) => event.preventDefault());
    }
  });

  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

  phoneLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.includes('[RSVP')) {
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (event) => event.preventDefault());
    }
  });
});
