/* =========================================================
   Creative Doodles — script.js
   1) Floating background shapes
   2) Hero blob characters with googly eyes that follow the cursor
   3) Doodle Weather widget (Open-Meteo public API, no key needed)
   ========================================================= */

/* ---------- 1. floating background doodles ---------- */
(function backgroundDoodles(){
  const holder = document.getElementById('bgDoodles');
  const colors = ['#ff6b5b', '#ff9f45', '#5b8def', '#4fd8bd', '#ff8fc7', '#ffd23f'];
  const shapes = ['circle', 'star', 'blob'];
  const count = window.innerWidth < 700 ? 12 : 22;

  function starPoints(cx, cy, r1, r2, points){
    let out = '';
    for(let i=0;i<points*2;i++){
      const r = i % 2 === 0 ? r1 : r2;
      const a = (Math.PI / points) * i - Math.PI/2;
      out += `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)} `;
    }
    return out.trim();
  }

  for(let i=0;i<count;i++){
    const size = 10 + Math.random()*26;
    const color = colors[Math.floor(Math.random()*colors.length)];
    const shape = shapes[Math.floor(Math.random()*shapes.length)];
    const left = Math.random()*100;
    const duration = 18 + Math.random()*22;
    const delay = -Math.random()*30;
    const startBottom = -10 - Math.random()*90;

    const wrapper = document.createElement('span');
    wrapper.style.left = left + 'vw';
    wrapper.style.top = startBottom + 'vh';
    wrapper.style.animationDuration = duration + 's';
    wrapper.style.animationDelay = delay + 's';

    if(shape === 'circle'){
      wrapper.style.width = size + 'px';
      wrapper.style.height = size + 'px';
      wrapper.style.background = color;
      wrapper.style.borderRadius = '50%';
    } else if (shape === 'blob'){
      wrapper.style.width = size + 'px';
      wrapper.style.height = size + 'px';
      wrapper.style.background = color;
      wrapper.style.borderRadius = '58% 42% 46% 54% / 52% 48% 52% 48%';
    } else {
      wrapper.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <polygon points="${starPoints(50,50,50,20,5)}" fill="${color}"/>
      </svg>`;
    }
    holder.appendChild(wrapper);
  }
})();

/* ---------- 2. hero blob characters with googly eyes ---------- */
const heroBlobs = [];

(function heroCharacters(){
  const stage = document.getElementById('heroStage');
  if(!stage) return;

  // layout: [color, size%, top%, left%, tilt-deg, eyeSize%]
  const config = [
    { color:'var(--coral)',    size:150, top:'6%',  left:'4%',  tilt:-8,  eyes:34 },
    { color:'var(--sky)',      size:120, top:'46%', left:'0%',  tilt:6,   eyes:32 },
    { color:'var(--orange)',   size:190, top:'34%', left:'34%', tilt:0,   eyes:30 },
    { color:'var(--mint)',     size:110, top:'2%',  left:'66%', tilt:10,  eyes:34 },
    { color:'var(--dark-blob)',size:130, top:'54%', left:'62%', tilt:-6,  eyes:34 },
  ];

  config.forEach((cfg, i) => {
    const blob = document.createElement('div');
    blob.className = 'blob';
    blob.style.setProperty('--tilt', cfg.tilt + 'deg');
    blob.style.width = cfg.size + 'px';
    blob.style.height = cfg.size + 'px';
    blob.style.top = cfg.top;
    blob.style.left = cfg.left;
    blob.style.background = cfg.color;
    blob.style.animationDelay = (i * 0.4) + 's';

    const eyeSize = cfg.size * (cfg.eyes/100);
    for(let e=0; e<2; e++){
      const eye = document.createElement('div');
      eye.className = 'eye';
      eye.style.width = eyeSize + 'px';
      eye.style.height = eyeSize + 'px';
      const pupil = document.createElement('div');
      pupil.className = 'pupil';
      pupil.style.width = (eyeSize*0.5) + 'px';
      pupil.style.height = (eyeSize*0.5) + 'px';
      eye.appendChild(pupil);
      blob.appendChild(eye);
      heroBlobs.push({ eye, pupil });
    }

    const mouth = document.createElement('div');
    mouth.className = 'mouth';
    mouth.style.width = (cfg.size*0.34) + 'px';
    mouth.style.height = (cfg.size*0.18) + 'px';
    blob.appendChild(mouth);

    stage.appendChild(blob);
  });
})();

/* pupils follow the pointer, clamped inside each eye */
function updatePupils(pointerX, pointerY){
  heroBlobs.forEach(({eye, pupil}) => {
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = pointerX - cx;
    const dy = pointerY - cy;
    const angle = Math.atan2(dy, dx);
    const maxDist = rect.width * 0.22;
    const dist = Math.min(maxDist, Math.hypot(dx,dy)/6);
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    pupil.style.transform = `translate(${px}px, ${py}px)`;
  });
}
window.addEventListener('mousemove', e => updatePupils(e.clientX, e.clientY));
window.addEventListener('touchmove', e => {
  if(e.touches[0]) updatePupils(e.touches[0].clientX, e.touches[0].clientY);
}, { passive:true });
/* ---------- 3. Doodle Weather widget ---------- */
(function weatherWidget(){
  const form      = document.getElementById('citySearchForm');
  const input     = document.getElementById('cityInput');
  const locBtn    = document.getElementById('locBtn');
  const resultBox = document.getElementById('weatherResult');
  const wBlob     = document.getElementById('wBlob');
  const wMouth    = document.getElementById('wMouth');

  const weatherColors = { hot: 'var(--coral)', mild: 'var(--mint)', cold: 'var(--sky)' };

  // WMO weather codes -> short description
  const codeMap = {
    0:'Clear sky', 1:'Mostly clear', 2:'Partly cloudy', 3:'Overcast',
    45:'Foggy', 48:'Foggy',
    51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
    61:'Light rain', 63:'Rain', 65:'Heavy rain',
    71:'Light snow', 73:'Snow', 75:'Heavy snow',
    80:'Rain showers', 81:'Rain showers', 82:'Violent showers',
    95:'Thunderstorm', 96:'Thunderstorm', 99:'Thunderstorm'
  };

  function setFace(tempC){
    let mood = 'mild';
    if(tempC >= 30) mood = 'hot';
    else if(tempC <= 12) mood = 'cold';

    wBlob.style.background = weatherColors[mood];

    if(mood === 'hot'){
      wMouth.style.borderRadius = '50% 50% 0 0';
      wMouth.style.borderBottom = 'none';
      wMouth.style.borderTop = '5px solid #20202a';
      wMouth.style.bottom = '20%';
    } else if(mood === 'cold'){
      wMouth.style.borderRadius = '0 0 0 0';
      wMouth.style.borderTop = 'none';
      wMouth.style.borderBottom = '5px solid #20202a';
      wMouth.style.width = '18%';
      wMouth.style.bottom = '26%';
    } else {
      wMouth.style.borderTop = 'none';
      wMouth.style.borderBottom = '5px solid #20202a';
      wMouth.style.borderRadius = '0 0 50% 50%';
      wMouth.style.width = '34%';
      wMouth.style.bottom = '26%';
    }
  }

  function showLoading(){
    resultBox.innerHTML = `<p class="hint">Fetching the sky's mood…</p>`;
  }
  function showError(msg){
    resultBox.innerHTML = `<p class="err">${msg}</p>`;
  }
  function showResult({ place, tempC, code }){
    const desc = codeMap[code] || 'Mixed conditions';
    setFace(tempC);
    resultBox.innerHTML = `
      <div class="temp-row">
        <span class="temp">${Math.round(tempC)}°C</span>
        <span class="place">${place}</span>
      </div>
      <p class="desc">${desc} right now.</p>
    `;
  }

  async function fetchWeatherByCoords(lat, lon, place){
    showLoading();
    try{
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
      const res = await fetch(url);
      if(!res.ok) throw new Error('bad-response');
      const data = await res.json();
      showResult({
        place: place || 'Your location',
        tempC: data.current.temperature_2m,
        code: data.current.weather_code
      });
    }catch(err){
      showError("Couldn't reach the weather service — check your connection and try again.");
    }
  }

  async function fetchWeatherByCity(city){
    showLoading();
    try{
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if(!geoData.results || !geoData.results.length){
        showError(`Couldn't find "${city}" — try a bigger nearby city.`);
        return;
      }
      const { latitude, longitude, name, country } = geoData.results[0];
      await fetchWeatherByCoords(latitude, longitude, `${name}, ${country}`);
    }catch(err){
      showError("Couldn't reach the weather service — check your connection and try again.");
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const city = input.value.trim();
    if(city) fetchWeatherByCity(city);
  });

  locBtn.addEventListener('click', () => {
    if(!navigator.geolocation){
      showError('Location access is not supported in this browser.');
      return;
    }
    showLoading();
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, 'Your location'),
      () => showError('Location permission denied — try searching a city instead.')
    );
  });
})();

/* ---------- 4. scroll-triggered reveal for the "about" section ---------- */
(function scrollReveal(){
  // split every .split-words heading into individual word spans
  document.querySelectorAll('.split-words').forEach(heading => {
    const words = heading.textContent.trim().split(/\s+/);
    heading.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      span.style.setProperty('--d', (i * 0.09) + 's');
      heading.appendChild(span);
      // keep the spaces between words
      if(i < words.length - 1) heading.appendChild(document.createTextNode(' '));
    });
  });

  // stagger the cards
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.setProperty('--d', (i * 0.12) + 's');
  });

  const targets = document.querySelectorAll('.split-words, .reveal');

  // no IntersectionObserver (very old browser)? just show everything.
  if(!('IntersectionObserver' in window)){
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // animate once, not every scroll
      }
    });
  }, { threshold: 0.25 });

  targets.forEach(el => observer.observe(el));
})();