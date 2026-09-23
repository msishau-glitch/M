const invitationData = {
  bride: 'Mutakulwa Mubita',
  groom: 'Robert Singogo',
  date: '30 October 2026',
  ceremony: 'Kalulushi New Apostolic Church',
  reception: 'Kalulushi Municipal Council Civic Centre, Main Hall',
  venue: 'Kalulushi, Zambia',
  rsvp: 'Kindly RSVP with the family'
};

const elements = {
  bride: document.querySelector('[data-text="bride"]'),
  groom: document.querySelector('[data-text="groom"]'),
  date: document.querySelector('[data-text="date"]'),
  ceremony: document.querySelector('[data-text="ceremony"]'),
  reception: document.querySelector('[data-text="reception"]'),
  venue: document.querySelector('[data-text="venue"]'),
  rsvp: document.querySelector('[data-text="rsvp"]')
};

function hydrateInvitation(data) {
  Object.entries(data).forEach(([key, value]) => {
    if (elements[key]) {
      elements[key].textContent = value;
    }
  });
}

function fillDefaults() {
  const userConfig = window.invitationConfig || {};
  const merged = { ...invitationData, ...userConfig };
  hydrateInvitation(merged);
}

function drawInvitationCanvas(ctx, canvas, frame = 0, totalFrames = 1) {
  const width = canvas.width;
  const height = canvas.height;
  const progress = totalFrames > 1 ? frame / totalFrames : 0;

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#fff7f4');
  background.addColorStop(0.55, '#f9e6e3');
  background.addColorStop(1, '#f0d9d7');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.24)';
  for (let i = 0; i < 8; i += 1) {
    const x = 70 + i * 120 + Math.sin((i + frame) * 0.8) * 14;
    const y = 110 + (i % 2) * 190;
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(122,74,82,0.14)';
  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  ctx.fillStyle = '#7b4d52';
  ctx.textAlign = 'center';
  ctx.font = '600 42px "Georgia", serif';
  ctx.fillText('Wedding Invitation', width / 2, 130);

  const nameY = 440;
  const nameFade = 0.45 + Math.sin(progress * Math.PI * 2) * 0.35;
  ctx.fillStyle = `rgba(123,77,82,${nameFade})`;
  ctx.font = '600 128px "Cormorant Garamond", serif';
  ctx.fillText(invitationData.bride, width / 2, nameY);
  ctx.fillStyle = '#d7b46a';
  ctx.fillText('&', width / 2, nameY + 110);
  ctx.fillStyle = `rgba(123,77,82,${nameFade})`;
  ctx.fillText(invitationData.groom, width / 2, nameY + 220);

  const details = [
    ['Date', invitationData.date],
    ['Ceremony', invitationData.ceremony],
    ['Reception', invitationData.reception],
    ['Venue', invitationData.venue],
    ['RSVP', invitationData.rsvp]
  ];

  let yPos = 820;
  details.forEach(([label, value], index) => {
    ctx.fillStyle = '#a67a3d';
    ctx.font = '600 26px "Inter", sans-serif';
    ctx.fillText(label.toUpperCase(), width * 0.28, yPos + index * 110);

    ctx.fillStyle = '#312827';
    ctx.font = '500 30px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(value, width * 0.4, yPos + index * 110);
    ctx.textAlign = 'center';
  });

  ctx.fillStyle = 'rgba(123,77,82,0.8)';
  ctx.font = 'italic 28px "Georgia", serif';
  ctx.fillText('With love, we await your presence.', width / 2, height - 120);
}

function exportPNG() {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  drawInvitationCanvas(ctx, canvas);

  const link = document.createElement('a');
  link.download = 'wedding-invitation.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function exportMP4() {
  if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    alert('This browser does not support MP4 export. Use Chrome or Edge for the best experience.');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(30);
  const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm;codecs=vp9';
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wedding-invitation.mp4';
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalFrames = 90;
  let frame = 0;

  recorder.start();

  function animate() {
    drawInvitationCanvas(ctx, canvas, frame, totalFrames);
    frame += 1;

    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      recorder.stop();
    }
  }

  animate();
}

fillDefaults();

document.getElementById('downloadPng').addEventListener('click', exportPNG);
document.getElementById('downloadMp4').addEventListener('click', exportMP4);
