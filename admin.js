const ADMIN_PASSCODE = 'wedding-admin-2026';
const WEDDING_CONFIG_KEY = 'wedding-config';
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

function getStoredResponses() {
  try {
    const raw = localStorage.getItem('wedding-rsvp-responses');
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function formatDate(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getStoredWeddingConfig() {
  try {
    const raw = localStorage.getItem(WEDDING_CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveWeddingConfig(config) {
  localStorage.setItem(WEDDING_CONFIG_KEY, JSON.stringify(config));
  window.invitationConfig = config;
}

function populateWeddingForm() {
  const form = document.getElementById('wedding-config-form');
  if (!form) return;

  const config = { ...DEFAULT_WEDDING_CONFIG, ...getStoredWeddingConfig() };
  const formData = new FormData(form);

  formData.forEach(() => {});

  Object.entries(config).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);
    if (!field) return;
    if (field.type === 'checkbox') {
      field.checked = Boolean(value);
      return;
    }
    if (field.tagName === 'SELECT') {
      field.value = String(value);
      return;
    }
    field.value = value;
  });
}

function renderDashboard() {
  const responses = getStoredResponses();

  const totalResponsesEl = document.getElementById('total-responses');
  const attendingCountEl = document.getElementById('attending-count');
  const notAttendingCountEl = document.getElementById('not-attending-count');
  const expectedGuestsEl = document.getElementById('expected-guests');
  const tableBody = document.getElementById('responses-body');

  const attending = responses.filter((response) => response.attendance === 'attending').length;
  const notAttending = responses.filter((response) => response.attendance === 'not_attending').length;
  const expectedGuests = responses
    .filter((response) => response.attendance === 'attending')
    .reduce((sum, response) => sum + Number(response.guestCount || 0), 0);

  totalResponsesEl.textContent = String(responses.length);
  attendingCountEl.textContent = String(attending);
  notAttendingCountEl.textContent = String(notAttending);
  expectedGuestsEl.textContent = String(expectedGuests);

  if (!responses.length) {
    tableBody.innerHTML = '<tr><td colspan="5">No RSVP responses yet.</td></tr>';
    return;
  }

  const sortedResponses = [...responses].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  tableBody.innerHTML = sortedResponses
    .map((response) => {
      const attendingLabel = response.attendance === 'attending' ? 'Attending' : 'Not attending';
      const badgeClass = response.attendance === 'attending' ? 'attending' : 'not-attending';
      return `
        <tr>
          <td>${response.guestName || 'Unknown guest'}</td>
          <td><span class="badge ${badgeClass}">${attendingLabel}</span></td>
          <td>${response.guestCount || 0}</td>
          <td>${(response.message || '—').replace(/</g, '&lt;')}</td>
          <td>${formatDate(response.submittedAt)}</td>
        </tr>
      `;
    })
    .join('');
}

function unlockAdmin() {
  const passInput = document.getElementById('admin-passcode');
  const gate = document.getElementById('access-gate');
  const content = document.getElementById('admin-content');
  const entered = passInput.value.trim();

  if (entered !== ADMIN_PASSCODE) {
    passInput.focus();
    passInput.value = '';
    alert('Incorrect passcode.');
    return;
  }

  gate.hidden = true;
  content.hidden = false;
  renderDashboard();
}

window.addEventListener('DOMContentLoaded', () => {
  const unlockButton = document.getElementById('unlock-admin');
  const passInput = document.getElementById('admin-passcode');
  const configForm = document.getElementById('wedding-config-form');

  if (unlockButton) {
    unlockButton.addEventListener('click', unlockAdmin);
  }

  if (passInput) {
    passInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        unlockAdmin();
      }
    });
  }

  if (configForm) {
    populateWeddingForm();

    configForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(configForm);
      const config = Object.fromEntries(formData.entries());
      config.hasPhotos = config.hasPhotos === 'true';
      config.photoCount = Number(config.photoCount || 0);
      saveWeddingConfig(config);
      alert('Wedding details saved successfully.');
      const page = document.getElementById('wedding-config-form');
      if (page) {
        page.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});
