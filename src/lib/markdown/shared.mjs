/** @param {string} value */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {Array<{ title: string, description?: string, href: string }>} items
 * @param {string} [ariaLabel]
 */
export function buildPortalCardListHtml(items, ariaLabel = 'Материалы раздела') {
  if (items.length === 0) {
    return '';
  }
  const cards = items
    .map(
      (item) =>
        `<li class="portal-card-list__item"><a class="portal-card" href="${item.href}">` +
        `<span class="portal-card__title">${escapeHtml(item.title)}</span>` +
        (item.description
          ? `<span class="portal-card__desc">${escapeHtml(item.description)}</span>`
          : '') +
        `</a></li>`,
    )
    .join('');
  return `<nav class="portal-card-list" aria-label="${escapeHtml(ariaLabel)}"><ul class="portal-card-list__grid">${cards}</ul></nav>`;
}

/** @param {string} slug */
export function glossaryLetterRank(slug) {
  if (/^[0-9]$/.test(slug)) {
    return {group: 0, value: Number(slug)};
  }
  if (/^[А-ЯЁ]$/u.test(slug)) {
    return {group: 1, value: slug};
  }
  if (/^[A-Za-z]$/.test(slug)) {
    return {group: 2, value: slug.toUpperCase()};
  }
  return {group: 3, value: slug};
}

/** @param {{ slug: string }} a @param {{ slug: string }} b */
export function compareGlossaryLetters(a, b) {
  const left = glossaryLetterRank(a.slug);
  const right = glossaryLetterRank(b.slug);
  if (left.group !== right.group) {
    return left.group - right.group;
  }
  if (left.group === 0) {
    return left.value - right.value;
  }
  return String(left.value).localeCompare(String(right.value), 'ru');
}
