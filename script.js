
let DATA = {};
async function loadData(){
  const r = await fetch('data.json');
  DATA = await r.json();
  renderTabs();
  renderCatalog('tents');
  renderPackages();
  renderSummary();
  initMap();
}

function renderTabs(){
  const tabs = document.querySelector('#tabs');
  const cats = [
    ['tents','Tents'],
    ['tables','Tables'],
    ['chairs','Chairs'],
    ['dancefloors','Dance Floors']
  ];
  tabs.innerHTML = '';
  cats.forEach(([key,label],i)=>{
    const b = document.createElement('button');
    b.className = 'tab'+(i===0?' active':'');
    b.textContent = label;
    b.onclick = ()=>{
      document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active'));
      b.classList.add('active');
      renderCatalog(key);
    };
    tabs.appendChild(b);
  });
}

function imgFor(item){
  // Quick mapping of images by type/size; fall back to a default
  if(item.type==='pole' && item.size?.startsWith('40x80')) return 'assets/images/tent_wide_field.webp';
  if(item.type==='pole' && item.size?.startsWith('40x60')) return 'assets/images/tent_close_left.webp';
  if(item.type==='pole') return 'assets/images/backyard_tent.webp';
  if(item.type==='frame') return 'assets/images/tent_close_right.webp';
  if(item.id?.includes('chair')) return 'assets/images/tent_van.webp';
  if(item.id?.includes('table')) return 'assets/images/interior_hero.webp';
  if(item.id?.includes('dance')) return 'assets/images/tent_close_left.webp';
  return 'assets/images/backyard_tent.webp';
}

function renderCatalog(key){
  const grid = document.querySelector('#grid');
  grid.innerHTML = '';
  const items = DATA[key];
  items.forEach(item=>{
    const price = item.price ?? item.price_min;
    const priceTxt = item.price ? `$${item.price.toFixed(2)}` : `$${item.price_min.toFixed(2)}–$${item.price_max.toFixed(2)}`;
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `
      <img src="${imgFor(item)}" alt="${item.name||item.size||item.id}">
      <h4>${item.name || item.size}</h4>
      <div class="meta"><span>${priceTxt}</span><span class="badge">${key}</span></div>
      <div class="body">${item.type? (item.type[0].toUpperCase()+item.type.slice(1))+' tent' : ''}</div>
      <div class="actions">
        <button class="button" onclick="addToQuote('${key}','${item.id}')">Add</button>
        <button class="button secondary" onclick="showDetails('${key}','${item.id}')">Details</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function showDetails(cat,id){
  const item = DATA[cat].find(x=>x.id===id);
  alert((item.name||id)+'\n\nPricing shown is a demo. Delivery not included.');
}

const CART = {};
function addToQuote(cat,id,qty=1){
  const key = cat+':'+id;
  CART[key] = (CART[key]||0) + qty;
  renderSummary();
}
function removeFromQuote(key){ delete CART[key]; renderSummary(); }

function computeSubtotal(){
  let total=0;
  for(const key in CART){
    const [cat,id] = key.split(':');
    const item = DATA[cat].find(x=>x.id===id);
    const qty = CART[key];
    const price = item.price ?? item.price_min ?? 0;
    total += price * qty;
  }
  return total;
}

function estimateDelivery(miles){
  // Demo: $95 base + $2.25/mi
  return 95 + 2.25 * miles;
}

function renderSummary(){
  const list = document.querySelector('#summary-list');
  list.innerHTML='';
  for(const key in CART){
    const [cat,id]=key.split(':');
    const item = DATA[cat].find(x=>x.id===id);
    const qty = CART[key];
    const line = document.createElement('div');
    line.style.display='flex';
    line.style.justifyContent='space-between';
    line.style.gap='6px';
    line.innerHTML = `<span>${qty}× ${item.name||item.size}</span>
                      <span>$${((item.price??item.price_min)*qty).toFixed(2)}</span>`;
    list.appendChild(line);
  }
  const miles = parseFloat(document.querySelector('#miles').value||'40');
  const subtotal = computeSubtotal();
  const del = estimateDelivery(miles);
  const total = subtotal + del;
  document.querySelector('#subtotal').textContent = '$'+subtotal.toFixed(2);
  document.querySelector('#delivery').textContent = '$'+del.toFixed(2);
  document.querySelector('#total').textContent = '$'+total.toFixed(2);
}

function addPackageToQuote(pkg){
  const p = [...DATA.packages_party, ...DATA.packages_wedding].find(x=>x.id===pkg);
  if(!p){ alert('Package not found'); return; }
  // Add rough typical counts
  if(pkg==='party-20') addToQuote('tents','pole-20x20');
  if(pkg==='party-40') addToQuote('tents','pole-20x30');
  if(pkg==='party-60') addToQuote('tents','pole-20x40');
  if(pkg.startsWith('wed-pole-100')) addToQuote('tents','pole-40x60');
  if(pkg.startsWith('wed-pole-150')) addToQuote('tents','pole-40x80');
  if(pkg.startsWith('wed-pole-200')) addToQuote('tents','pole-40x100');
  alert(p.name+' added (demo).');
}

function renderPackages(){
  const wrap = document.querySelector('#packages');
  const makeCard = (p,tag)=>`
    <div class="card">
      <img src="assets/images/${tag==='party'?'backyard_tent.webp':'tent_wide_field.webp'}" alt="${p.name}">
      <h4>${p.name}</h4>
      <div class="meta"><span>$${p.price.toFixed(2)}</span><span class="badge">${tag}</span></div>
      <div class="body">${(p.includes||[]).slice(0,4).join(' • ')}${(p.includes||[]).length>4?'…':''}</div>
      <div class="actions">
        <button class="button" onclick="addPackageToQuote('${p.id}')">Add Package</button>
        <button class="button secondary" onclick="alert('${(p.includes||[]).join('\n')}')">View</button>
      </div>
    </div>`;
  const party = DATA.packages_party.map(p=>makeCard(p,'party')).join('');
  const wed = DATA.packages_wedding.map(p=>makeCard(p,'wedding')).join('');
  wrap.innerHTML = `<div class="section-head"><h3>Packages</h3></div>
                    <div class="grid">${party+wed}</div>`;
}

function initMap(){
  // Leaflet via CDN
  const link = document.createElement('link');
  link.rel='stylesheet'; link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  const s = document.createElement('script');
  s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  s.onload = ()=>{
    const map = L.map('map').setView([44.8012,-68.7778], 7); // Bangor
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18}).addTo(map);
    const miles = 120; // ~2 hour radius at 60 mph
    const circle = L.circle([44.8012,-68.7778], {radius: miles*1609.34, color:'#38bdf8'}).addTo(map);
    L.marker([44.8012,-68.7778]).addTo(map).bindPopup('Bangor, ME — Base');
  };
  document.body.appendChild(s);
}

document.addEventListener('DOMContentLoaded', loadData);
