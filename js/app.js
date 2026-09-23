const weddingConfig = {
  weddingDate: '2026-10-30T00:00:00',
  churchName: 'Kalulushi New Apostolic Church',
  churchTime: 'Time to be confirmed',
  receptionVenue: 'Kalulushi Municipal Council Civic Centre',
  receptionHall: 'Main Hall',
  receptionTime: 'Time to be confirmed',
  googleMapsUrl: 'https://maps.google.com/?q=Kalulushi%20Municipal%20Council%20Civic%20Centre',
  rsvpEndpoint: '',
  maxGuests: 10,
  maxMessageLength: 250,
  rsvpClosingDate: '2026-10-25T23:59:59',
};

const countdownEls = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
};

function hydrateConfig() {
  const fields = document.querySelectorAll('[data-config]');

  fields.forEach((field) => {
    const key = field.dataset.config;
    if (key in weddingConfig) {
      field.textContent = weddingConfig[key];
    }
  });

  const mapLink = document.getElementById('map-link');
  if (mapLink) {
    mapLink.href = weddingConfig.googleMapsUrl;
  }
}

function updateCountdown() {
  const target = new Date(weddingConfig.weddingDate).getTime();
  const countdownWrap = document.getElementById('countdown');

  if (!countdownEls.days || !countdownWrap) {
    return;
  }

  const now = Date.now();
  let diff = target - now;

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

function setRevealAnimations() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');

  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
}

function getStoredResponses() {
  try {
    const raw = localStorage.getItem('wedding-rsvp-responses');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveResponses(responses) {
  localStorage.setItem('wedding-rsvp-responses', JSON.stringify(responses));
}

function normalizeName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function isRsvpClosed() {
  const closingDate = new Date(weddingConfig.rsvpClosingDate).getTime();
  return Number.isFinite(closingDate) && Date.now() > closingDate;
}

function initRsvp() {
  const form = document.getElementById('rsvp-form');
  const formStatus = document.getElementById('form-status');
  const submitButton = document.getElementById('submit-rsvp');
  const confirmationBlock = document.getElementById('rsvp-confirmation');
  const confirmationName = document.getElementById('confirmation-name');
  const confirmationMessage = document.getElementById('confirmation-message');
  const attendanceSelect = document.getElementById('attendance');
  const guestCountWrap = document.getElementById('guest-count-wrap');
  const guestCountInput = document.getElementById('guest-count');

  if (!form) {
    return;
  }

  function updateGuestCountVisibility() {
    const attending = attendanceSelect?.value === 'yes';

    if (!guestCountWrap || !guestCountInput) {
      return;
    }

    guestCountWrap.hidden = !attending;
    guestCountInput.required = attending;
    guestCountInput.value = attending ? (guestCountInput.value || '1') : '1';
  }

  attendanceSelect?.addEventListener('change', updateGuestCountVisibility);
  updateGuestCountVisibility();

  if (isRsvpClosed()) {
    form.hidden = true;

    const closureMessage = document.createElement('p');
    closureMessage.className = 'rsvp-intro';
    closureMessage.textContent = 'RSVP IS NOW CLOSED';
    form.parentNode.prepend(closureMessage);
    return;
  }

  function setStatus(message, type = 'error') {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove('is-success', 'is-error');
    if (message) {
      formStatus.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }
  }

  function getFormValues() {
    const formData = new FormData(form);
    return {
      guestName: String(formData.get('guestName') || '').trim(),
      attendance: String(formData.get('attendance') || '').trim(),
      guestCount: Number(formData.get('guestCount') || 1),
      message: String(formData.get('message') || '').trim(),
      honeypot: String(formData.get('website') || '').trim(),
    };
  }

  function validate(values) {
    if (values.honeypot) {
      return { valid: false, message: 'Submission rejected.' };
    }

    if (!values.guestName) {
      return { valid: false, message: 'Please enter your name.' };
    }

    if (!values.attendance) {
      return { valid: false, message: 'Please select whether you will attend.' };
    }

    if (values.attendance === 'yes') {
      if (!Number.isInteger(values.guestCount) || values.guestCount < 1) {
        return { valid: false, message: 'Please enter a valid number of guests.' };
      }

      if (values.guestCount > weddingConfig.maxGuests) {
        return { valid: false, message: `Guest count cannot exceed ${weddingConfig.maxGuests}.` };
      }
    }

    if (values.message.length > weddingConfig.maxMessageLength) {
      return { valid: false, message: 'Your message is too long. Please keep it under 250 characters.' };
    }

    return { valid: true };
  }

  function saveLocalRsvp(payload) {
    const stored = getStoredResponses();
    const duplicateMatch = stored.find((entry) => {
      const sameName = normalizeName(entry.guestName) === normalizeName(payload.guestName);
      const sameAttendance = entry.attendance === payload.attendance;
      const sameMessage = (entry.message || '').trim() === (payload.message || '').trim();
      const sameDay = new Date(entry.submittedAt).toDateString() === new Date(payload.submittedAt).toDateString();
      return sameName && sameAttendance && sameMessage && sameDay;
    });

    if (duplicateMatch) {
      payload.isDuplicate = true;
    }

    stored.push(payload);
    saveResponses(stored);
  }

  async function submitToEndpoint(payload) {
    const endpoint = weddingConfig.rsvpEndpoint;

    if (!endpoint) {
      saveLocalRsvp(payload);
      return { ok: true, simulated: true };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Unable to submit RSVP.');
    }

    const saved = getStoredResponses();
    saved.push(payload);
    saveResponses(saved);

    return { ok: true, simulated: false };
  }

  function showConfirmation(name, attending, duplicateFlag = false) {
    if (confirmationName) {
      confirmationName.textContent = name;
    }

    if (confirmationMessage) {
      confirmationMessage.textContent = attending
        ? duplicateFlag
          ? 'This looks like a duplicate submission and has been recorded for review. We look forward to celebrating with you!'
          : 'We look forward to celebrating with you!'
        : 'We appreciate your response.';
    }

    if (confirmationBlock) {
      confirmationBlock.hidden = false;
    }

    form.hidden = true;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const values = getFormValues();
    const validation = validate(values);

    if (!validation.valid) {
      setStatus(validation.message, 'error');
      return;
    }

    const payload = {
      id: `rsvp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      guestName: values.guestName,
      attendance: values.attendance === 'yes' ? 'attending' : 'not_attending',
      guestCount: values.attendance === 'yes' ? Number(values.guestCount) : 0,
      message: values.message,
      submittedAt: new Date().toISOString(),
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'SUBMITTING...';
    }

    try {
      await submitToEndpoint(payload);
      const duplicateFlag = Boolean(
        getStoredResponses().find((entry) => {
          if (entry.id === payload.id) return false;
          const sameName = normalizeName(entry.guestName) === normalizeName(payload.guestName);
          const sameAttendance = entry.attendance === payload.attendance;
          const sameMessage = (entry.message || '').trim() === (payload.message || '').trim();
          return sameName && sameAttendance && sameMessage;
        })
      );

      showConfirmation(payload.guestName, payload.attendance === 'attending', duplicateFlag);
      setStatus('Thank you for your response.', 'success');
      form.reset();
      updateGuestCountVisibility();
    } catch (error) {
      setStatus('We could not submit your RSVP. Please try again.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'CONFIRM RSVP';
      }
    }
  });

  form.addEventListener('input', () => {
    if (formStatus && formStatus.textContent) {
      setStatus('');
    }
  });
}

hydrateConfig();
updateCountdown();
setRevealAnimations();
initRsvp();
setInterval(updateCountdown, 1000);
