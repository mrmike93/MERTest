
let GALLERY = [];
let DATA = {
  tents:[
    {id:'pole-40x80',name:'40x80 Pole Tent',price:1800},
    {id:'pole-40x60',name:'40x60 Pole Tent',price:1500},
    {id:'frame-40x60',name:'40x60 Frame Tent',price:2700}
  ],
  tables:[{id:'table-8ft',name:'8ft Banquet Table',price:12},{id:'table-round60',name:'60\" Round Table',price:15}],
  chairs:[{id:'chair-white',name:'White Resin Padded',price:4}],
  dancefloors:[{id:'df-12x12',name:'Dance Floor 12x12',price:300}]
};
const CART = {};
function addToQuote(cat,id,qty=1){const k=cat+':'+id;CART[k]=(CART[k]||0)+qty;renderSummary();}
function renderSummary(){
  const list=document.querySelector('#summary-list'); list.innerHTML='';
  for(const k in CART){const[cat,id]=k.split(':');const it=(DATA[cat]||[]).find(x=>x.id===id)||{};
    const qty=CART[k]; const line=document.createElement('div'); line.className='summary';
    line.innerHTML=`<span>${qty}× ${it.name||id}</span><b>$${((it.price||0)*qty).toFixed(2)}</b>`; list.appendChild(line);}
  const miles=parseFloat(document.querySelector('#miles').value||'40'); const sub=Object.keys(CART).reduce((s,k)=>{
    const[cat,id]=k.split(':');const it=(DATA[cat]||[]).find(x=>x.id===id)||{};return s+(it.price||0)*CART[k];},0);
  const del=95+2.25*miles; document.querySelector('#subtotal').textContent='$'+sub.toFixed(2);
  document.querySelector('#delivery').textContent='$'+del.toFixed(2); document.querySelector('#total').textContent='$'+(sub+del).toFixed(2);
}
function mountGallery(){
  const wrap=document.querySelector('#gallery'); GALLERY.forEach(src=>{const img=document.createElement('img');img.src=src;wrap.appendChild(img);});
}
document.addEventListener('DOMContentLoaded', ()=>{renderSummary(); mountGallery();});
