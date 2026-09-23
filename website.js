const DEFAULT_WEDDING_CONFIG = {
  brideName: 'Mutakulwa Mubita',
  groomName: 'Robert Singogo',
  weddingDate: '2026-10-30',
  ceremonyTime: '10:00 AM',
  ceremonyVenue: 'Kalulushi New Apostolic Church',
  receptionTime: '2:00 PM',
  receptionVenue: 'Kalulushi Municipal Council Civic Centre, Main Hall',
  rsvpName: 'Mutakulwa & Robert',
  rsvpPhone: '+260 000 000 000',
  dressCode: 'Formal Elegance',
  specialMessage: 'We look forward to celebrating with you.',
  quote: 'Above all, put on love, which binds everything together in perfect harmony.',
  quoteSource: 'Colossians 3:14',
  hasPhotos: true,
  photoCount: 0
};

function getSavedWeddingConfig() {
  try {
    const raw = localStorage.getItem('wedding-config');
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function formatWeddingDate(dateValue) {
  if (!dateValue) return '30 OCTOBER 2026';
  if (/\d{4}-\d{2}-\d{2}/.test(dateValue)) {
    const date = new Date(`${dateValue}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('en-ZA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(date).toUpperCase();
    }
  }
  return String(dateValue).toUpperCase();
}

function applyWeddingConfig() {
  const savedConfig = getSavedWeddingConfig();
  const config = { ...DEFAULT_WEDDING_CONFIG, ...savedConfig };

  const brideElement = document.getElementById('bride-name');
  const groomElement = document.getElementById('groom-name');
  const brideElement2 = document.getElementById('bride-name-2');
  const groomElement2 = document.getElementById('groom-name-2');
  const weddingDateElement = document.getElementById('wedding-date');
  const weddingDateElement2 = document.getElementById('wedding-date-2');
  const weddingTimeElement2 = document.getElementById('wedding-time-2');
  const venueElement2 = document.getElementById('venue-2');
  const ceremonyVenueElement = document.getElementById('ceremony-venue');
  const ceremonyTimeElement = document.getElementById('ceremony-time');
  const receptionVenueElement = document.getElementById('reception-venue');
  const receptionTimeElement = document.getElementById('reception-time');
  const rsvpContactElement = document.getElementById('rsvp-contact');
  const quoteElement = document.querySelector('.verse p');
  const quoteSourceElement = document.querySelector('.verse strong');

  const formattedDate = formatWeddingDate(config.weddingDate);

  if (brideElement) brideElement.textContent = config.brideName.toUpperCase();
  if (groomElement) groomElement.textContent = config.groomName.toUpperCase();
  if (brideElement2) brideElement2.textContent = config.brideName.toUpperCase();
  if (groomElement2) groomElement2.textContent = config.groomName.toUpperCase();
  if (weddingDateElement) weddingDateElement.textContent = formattedDate;
  if (weddingDateElement2) weddingDateElement2.textContent = formattedDate;
  if (weddingTimeElement2) weddingTimeElement2.textContent = config.ceremonyTime || config.receptionTime || 'TIME';
  if (venueElement2) venueElement2.textContent = config.ceremonyVenue || config.receptionVenue || 'VENUE';
  if (ceremonyVenueElement) ceremonyVenueElement.textContent = config.ceremonyVenue;
  if (ceremonyTimeElement) ceremonyTimeElement.textContent = config.ceremonyTime;
  if (receptionVenueElement) receptionVenueElement.textContent = config.receptionVenue;
  if (receptionTimeElement) receptionTimeElement.textContent = config.receptionTime;
  if (rsvpContactElement) rsvpContactElement.textContent = `RSVP: ${config.rsvpName} • ${config.rsvpPhone}`;
  if (quoteElement) quoteElement.textContent = `“${config.quote}”`;
  if (quoteSourceElement) quoteSourceElement.textContent = config.quoteSource;

  const mapUrl = encodeURIComponent(config.receptionVenue || 'Wedding Venue');
  const mapButton = document.querySelector('.map-button');
  if (mapButton) {
    mapButton.href = `https://maps.google.com/?q=${mapUrl}`;
  }
}

const weddingDate = new Date('2026-10-30T00:00:00');

const revealItems = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => {
  observer.observe(item);
});

const countdownEls = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds')
};

function updateCountdown() {
  const now = new Date();
  const target = weddingDate.getTime();
  const current = now.getTime();
  const countdownWrap = document.getElementById('countdown');

  let diff = target - current;

  if (diff <= 0) {
    countdownWrap.innerHTML = '<div class="time-box" style="grid-column: 1 / -1;"><span>THE DAY HAS ARRIVED</span><small>We are married</small></div>';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);

  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);

  const seconds = Math.floor(diff / 1000);

  countdownEls.days.textContent = String(days).padStart(2, '0');
  countdownEls.hours.textContent = String(hours).padStart(2, '0');
  countdownEls.minutes.textContent = String(minutes).padStart(2, '0');
  countdownEls.seconds.textContent = String(seconds).padStart(2, '0');
}

applyWeddingConfig();
updateCountdown();
setInterval(updateCountdown, 1000);

const RSVP_CONFIG = {
  maxGuests: 10,
  submitUrl: '',
  maxMessageLength: 250
};

const form = document.getElementById('rsvp-form');
const formStatus = document.getElementById('form-status');
const submitButton = document.getElementById('submit-rsvp');
const confirmationBlock = document.getElementById('rsvp-confirmation');
const confirmationName = document.getElementById('confirmation-name');
const confirmationMessage = document.getElementById('confirmation-message');

if (form) {
  const configuredMaxGuests = Number(form.dataset.maxGuests || RSVP_CONFIG.maxGuests);
  RSVP_CONFIG.maxGuests = configuredMaxGuests;

  function setStatus(message, type = 'error') {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove('is-success', 'is-error');
    if (message) {
      formStatus.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
  }

  function clearStatus() {
    setStatus('');
  }

  function getFormData() {
    const formData = new FormData(form);
    const guestName = String(formData.get('guestName') || '').trim();
    const attendance = String(formData.get('attendance') || '').trim();
    const guestCount = Number(formData.get('guestCount') || 0);
    const message = String(formData.get('message') || '').trim();
    const honeypotValue = String(formData.get('website') || '').trim();

    return {
      guestName,
      attendance,
      guestCount,
      message,
      honeypotValue
    };
  }

  function validateForm(data) {
    if (data.honeypotValue) {
      return { valid: false, message: 'Submission rejected.' };
    }

    if (!data.guestName) {
      return { valid: false, message: 'Please enter your name.' };
    }

    if (!data.attendance) {
      return { valid: false, message: 'Please confirm whether you will attend.' };
    }

    if (!Number.isInteger(data.guestCount) || data.guestCount < 1) {
      return { valid: false, message: 'Please enter a valid number of guests.' };
    }

    if (data.guestCount > RSVP_CONFIG.maxGuests) {
      return {
        valid: false,
        message: `The guest count cannot exceed ${RSVP_CONFIG.maxGuests}.`
      };
    }

    if (data.message.length > RSVP_CONFIG.maxMessageLength) {
      return {
        valid: false,
        message: 'Your message is too long. Please keep it under 250 characters.'
      };
    }

    return { valid: true };
  }

  function buildSubmissionPayload(data) {
    return {
      id: `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      guestName: data.guestName,
      attendance: data.attendance === 'yes' ? 'attending' : 'not_attending',
      guestCount: Number(data.guestCount),
      message: data.message,
      submittedAt: new Date().toISOString()
    };
  }

  async function submitToFormService(payload) {
    const endpoint = RSVP_CONFIG.submitUrl;

    if (!endpoint) {
      return { ok: true, simulated: true };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload),
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Unable to submit RSVP.');
    }

    return { ok: true, simulated: false };
  }

  function showConfirmation(name, attending) {
    confirmationName.textContent = name;
    confirmationMessage.textContent = attending
      ? 'We look forward to celebrating with you!'
      : 'Thank you for letting us know. We appreciate your response.';

    form.hidden = true;
    confirmationBlock.hidden = false;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (submitButton.disabled) {
      return;
    }

    const formData = getFormData();
    const validation = validateForm(formData);

    if (!validation.valid) {
      setStatus(validation.message, 'error');
      return;
    }

    const payload = buildSubmissionPayload(formData);

    submitButton.disabled = true;
    submitButton.textContent = 'SUBMITTING...';
    clearStatus();

    try {
      await submitToFormService(payload);
      showConfirmation(payload.guestName, payload.attendance === 'attending');
      form.reset();
      setStatus('Thank you for your response.', 'success');
    } catch (error) {
      setStatus('We could not send your RSVP right now. Please try again in a moment.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'CONFIRM RSVP';
    }
  });

  form.addEventListener('input', () => {
    if (formStatus.textContent) {
      clearStatus();
    }
  });
}
