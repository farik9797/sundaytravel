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
    const f = new FormData(form);
    const text = form.dataset.tg
      .replace(/\{(\w+)\}/g, (_, k) => fmt(String(f.get(k) || '').trim()) || '—')
      .replace(/, обратно —/, '');
    window.open('https://t.me/Sundaytraveluz?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }));
})();
