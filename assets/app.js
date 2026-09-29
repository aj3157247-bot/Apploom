(() => {
const $ = s => document.querySelector(s);
const st = { apps: [], cats: [], cat: 'همه', q: '', sort: 'pop' };
const num = s => { const n = parseFloat(s); return /K/i.test(s) ? n * 1e3 : /M/i.test(s) ? n * 1e6 : n; };
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const grad = c => `linear-gradient(135deg,${c},color-mix(in srgb,${c} 55%,#000))`;

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }

function view() {
  const q = st.q.trim().toLowerCase();
  let l = st.apps.filter(a => (st.cat === 'همه' || a.cat === st.cat) && (!q || (a.name + a.dev + a.cat + a.desc).toLowerCase().includes(q)));
  const s = { pop: (a, b) => num(b.downloads) - num(a.downloads), rate: (a, b) => b.rating - a.rating, new: (a, b) => b.updated.localeCompare(a.updated), name: (a, b) => a.name.localeCompare(b.name, 'fa') }[st.sort];
  l.sort(s);
  $('#grid').innerHTML = l.map(a => `<button class="card" data-id="${esc(a.id)}"><span class="ico" style="background:${grad(a.color)}">${esc(a.icon)}</span><span><h3>${esc(a.name)}</h3><span class="meta">${esc(a.dev)}</span><br><span class="meta"><span class="star">★ ${fa(a.rating)}</span> · ${esc(a.cat)} · ${esc(a.size)}</span></span></button>`).join('');
  $('#empty').hidden = l.length > 0;
  $('#featWrap').hidden = !!q || st.cat !== 'همه';
}

function chips() {
  $('#chips').innerHTML = ['همه', ...st.cats].map(c => `<button class="chip" role="tab" aria-selected="${c === st.cat}">${esc(c)}</button>`).join('');
}

function open(id) {
  const a = st.apps.find(x => x.id === id); if (!a) return;
  $('#dlgBody').innerHTML = `<div class="d-top"><span class="ico" style="background:${grad(a.color)}">${esc(a.icon)}</span><div><h2 style="margin:0">${esc(a.name)}</h2><div class="meta">${esc(a.dev)}</div></div></div>
  <div class="d-body"><div class="facts"><div><b class="star">★ ${fa(a.rating)}</b>امتیاز</div><div><b>${esc(a.downloads)}</b>دانلود</div><div><b>${esc(a.size)}</b>حجم</div><div><b>${esc(a.ver)}</b>نسخه</div></div>
  <p>${esc(a.desc)}</p><p class="meta">آخرین به‌روزرسانی: ${esc(a.updated)} · دسته: ${esc(a.cat)}</p>
  <div class="btns"><a class="btn p" href="${esc(a.dl)}" rel="noopener" download>دانلود APK</a><button class="btn s" id="share">اشتراک</button><button class="btn s" id="close">بستن</button></div></div>`;
  $('#dlg').showModal();
  history.replaceState(null, '', '#' + id);
  $('#close').onclick = () => $('#dlg').close();
  $('#share').onclick = async () => { const u = location.href; try { navigator.share ? await navigator.share({ title: a.name, url: u }) : (await navigator.clipboard.writeText(u), toast('لینک کپی شد')); } catch (e) {} };
  $('#dlg a.btn').onclick = e => { if (a.dl === '#') { e.preventDefault(); toast('لینک دانلود هنوز در apps.json تنظیم نشده است'); } };
}

async function init() {
  try {
    const r = await fetch('data/apps.json'); if (!r.ok) throw 0;
    const d = await r.json(); st.apps = d.apps; st.cats = d.categories;
  } catch (e) {
    $('#grid').innerHTML = '<p class="empty">بارگذاری برنامه‌ها ناموفق بود. سایت را با GitHub Pages یا یک سرور محلی باز کنید (باز کردن مستقیم فایل کار نمی‌کند).</p>'; return;
  }
  $('#nApps').textContent = fa(st.apps.length); $('#nCats').textContent = fa(st.cats.length);
  $('#feat').innerHTML = st.apps.filter(a => a.featured).map(a => `<button class="feat" data-id="${esc(a.id)}" style="background:${grad(a.color)}"><span class="big">${esc(a.icon)}</span><small>${esc(a.cat)}</small><strong>${esc(a.name)}</strong><small>${esc(a.desc)}</small></button>`).join('');
  chips(); view();
  if (location.hash) open(decodeURIComponent(location.hash.slice(1)));
}

document.addEventListener('click', e => {
  const c = e.target.closest('[data-id]'); if (c) return open(c.dataset.id);
  const h = e.target.closest('.chip'); if (h) { st.cat = h.textContent; chips(); view(); }
  if (e.target.id === 'dlg') e.target.close();
});
$('#q').addEventListener('input', e => { st.q = e.target.value; view(); });
$('#sort').addEventListener('change', e => { st.sort = e.target.value; view(); });
$('#dlg').addEventListener('close', () => history.replaceState(null, '', location.pathname));
$('#theme').onclick = () => {
  const dark = matchMedia('(prefers-color-scheme:dark)').matches;
  const cur = document.documentElement.dataset.theme || (dark ? 'dark' : 'light');
  const n = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = n;
  try { localStorage.setItem('theme', n); } catch (e) {}
};
try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
init();
})();
