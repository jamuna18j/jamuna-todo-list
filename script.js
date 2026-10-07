const $ = s => document.querySelector(s);
const list = $('#list'), input = $('#input'), form = $('#form');
const KEY = 'dusk-tasks';
let tasks = [], filter = 'all';

try { tasks = JSON.parse(localStorage.getItem(KEY)) || []; } catch { tasks = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {} };

const ICON_DEL = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_CHK = '<svg viewBox="0 0 16 16"><path d="M2 8.5l4 4 8-9"/></svg>';

function render(animate = true) {
  const shown = tasks.filter(t => filter === 'all' || (filter === 'done') === t.done);
  list.innerHTML = '';
  shown.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'item' + (t.done ? ' done' : '');
    li.dataset.id = t.id;
    if (animate) li.style.animationDelay = i * 50 + 'ms'; else li.style.animation = 'none';
    li.innerHTML = `<button class="chk" aria-label="Toggle task">${ICON_CHK}</button>
      <span class="txt"></span>
      <button class="del" aria-label="Delete task">${ICON_DEL}</button>`;
    li.querySelector('.txt').textContent = t.text;
    list.append(li);
  });
  stats(shown.length);
}

function stats(shownCount) {
  const done = tasks.filter(t => t.done).length, total = tasks.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  $('#bar').style.strokeDashoffset = 113.1 * (1 - pct / 100);
  $('#bar').style.stroke = pct === 100 ? 'var(--mint)' : 'var(--peach)';
  $('#pct').textContent = pct + '%';
  $('#summary').textContent = !total ? 'Nothing planned yet.'
    : done === total ? 'All done. Enjoy the quiet.'
    : `${total - done} left, ${done} finished.`;
  $('#count').textContent = `${total} task${total === 1 ? '' : 's'}`;
  $('#clear').hidden = !done;
  const e = $('#empty');
  e.hidden = shownCount > 0;
  e.textContent = !total ? 'Add your first task above.'
    : filter === 'done' ? 'Nothing finished yet.' : 'Nothing left to do.';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) { form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); return; }
  tasks.unshift({ id: Date.now(), text, done: false });
  input.value = ''; save(); render();
});

list.addEventListener('click', e => {
  const li = e.target.closest('.item'); if (!li) return;
  const id = +li.dataset.id, t = tasks.find(x => x.id === id);
  if (e.target.closest('.chk')) {
    t.done = !t.done; save();
    li.classList.toggle('done', t.done);
    if (t.done) burst(e.target.closest('.chk'));
    setTimeout(() => render(false), filter === 'all' ? 450 : 350);
    stats(list.children.length);
  } else if (e.target.closest('.del')) {
    li.classList.add('out');
    tasks = tasks.filter(x => x.id !== id); save();
    setTimeout(() => render(false), 340);
  }
});

$('#clear').addEventListener('click', () => {
  document.querySelectorAll('.item.done').forEach(li => li.classList.add('out'));
  tasks = tasks.filter(t => !t.done); save();
  setTimeout(() => render(false), 340);
});

/* filter tabs with sliding pill */
const tabs = [...document.querySelectorAll('#filters button')], pill = $('#pill');
function movePill() {
  const on = tabs.find(b => b.classList.contains('on'));
  pill.style.width = on.offsetWidth + 'px';
  pill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
}
tabs.forEach(b => b.addEventListener('click', () => {
  tabs.forEach(x => x.classList.toggle('on', x === b));
  filter = b.dataset.f; movePill(); render();
}));
window.addEventListener('resize', movePill);

/* little colour burst when a task is finished */
function burst(el) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const colors = ['#7be0c3', '#ffb48a', '#ff7a9c', '#b9a8ff'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 40;
    s.className = 'spark';
    s.style.cssText = `left:${cx - 4}px;top:${cy - 4}px;background:${colors[i % 4]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d}px`;
    document.body.append(s); setTimeout(() => s.remove(), 800);
  }
}

/* greeting by time of day */
const h = new Date().getHours();
$('#greeting').textContent = h < 5 ? 'Still up?' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

render(); movePill();
document.fonts?.ready.then(movePill);