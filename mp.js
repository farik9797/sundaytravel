/* Многостраничный прототип: фильтр горящих туров и заявки с внутренних страниц */
(() => {
  // фильтр ленты горящих туров: страна, месяц вылета, цена за человека
  const grid = document.getElementById('hot');
  if (grid) {
    const cards = [...grid.querySelectorAll('.tour[data-c]')];
    const chips = [...document.querySelectorAll('[data-filter-c]')];
    const month = document.getElementById('f-month');
    const price = document.getElementById('f-price');
    const count = document.getElementById('f-count');
    const empty = document.getElementById('f-empty');
    let country = '';
    const apply = () => {
      const [lo, hi] = price.value ? price.value.split('-').map(Number) : [0, Infinity];
      let n = 0;
      cards.forEach((card) => {
        const usd = Number(card.dataset.usd);
        const ok = (!country || card.dataset.c === country)
          && (!month.value || card.dataset.m.split(' ').includes(month.value))
          && (!price.value || (usd > 0 && usd >= lo && usd < hi));
        card.hidden = !ok;
        if (ok) n += 1;
      });
      count.textContent = n;
      empty.hidden = n > 0;
      grid.hidden = n === 0;
    };
    const pick = (b) => {
      country = b.dataset.filterC;
      chips.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      apply();
    };
    chips.forEach((b) => b.addEventListener('click', () => pick(b)));
    month.addEventListener('change', apply);
    price.addEventListener('change', apply);
    document.querySelector('[data-filter-reset]')?.addEventListener('click', () => {
      month.value = '';
      price.value = '';
      pick(chips[0]);
      chips[0].focus();
    });
  }

  // страница тура: «Выбрать» подставляет пару отелей в форму заявки
  const pkgSelect = document.querySelector('.tlead__form [name="pkg"]');
  document.querySelectorAll('[data-pick]').forEach((a) => a.addEventListener('click', () => {
    if (pkgSelect) pkgSelect.value = a.dataset.pick;
  }));

  // сколько дней до вылета: считаем по календарю посетителя, после вылета метка не показывается
  const plural = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'день'
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'дня' : 'дней');
  document.querySelectorAll('[data-depart]').forEach((el) => {
    const [y, m, d] = el.dataset.depart.split('-').map(Number);
    const now = new Date();
    const days = Math.round((new Date(y, m - 1, d) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
    if (days < 0) return;
    el.textContent = days === 0 ? 'Вылет сегодня'
      : 'До вылета ' + days + ' ' + plural(days);
    el.hidden = false;
  });

  // нижняя панель «Забронировать» на телефоне: видна, когда на экране нет цены в шапке тура и формы заявки
  const tbar = document.querySelector('.tbar');
  const watch = [...document.querySelectorAll('.thero__buy, #zayavka')];
  if (tbar && watch.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      tbar.classList.toggle('is-on', seen.size === 0);
    });
    watch.forEach((el) => io.observe(el));
  }

  // формы с data-tg: заявка уходит менеджеру в Telegram готовым текстом
  const fmt = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v.split('-').reverse().join('.') : v);
  document.querySelectorAll('form[data-tg]').forEach((form) => form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [...form.querySelectorAll('[required]')].filter((el) => !el.value.trim());
    form.querySelectorAll('.field__error').forEach((el) => el.remove());
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    if (bad.length) {
      bad.forEach((el) => {
        const box = el.closest('.field, .pill-field');
        box.classList.add('is-invalid');
        el.setAttribute('aria-invalid', 'true');
        const hint = document.createElement('span');
        hint.className = 'field__error';
        hint.setAttribute('role', 'alert');
        hint.textContent = el.dataset.hint || 'Заполните поле';
        box.append(hint);
      });
      bad[0].focus();
      return;
    }
    const val = (k) => {
      const el = form.elements[k];
      if (!el) return '';
      return el.matches('select[data-label]') ? el.selectedOptions[0].textContent : el.value;
    };
    const text = form.dataset.tg
      .replace(/\{(\w+)\}/g, (_, k) => fmt(String(val(k)).trim()) || '—')
      .replace(/, обратно —/, '');
    window.open('https://t.me/Sundaytraveluz?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }));
})();
