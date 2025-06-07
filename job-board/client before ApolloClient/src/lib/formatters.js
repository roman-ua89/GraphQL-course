const locale = navigator.language;
const mediumDateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
const longDateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'long' });

export function formatDate(isoString, style = 'medium') {
  return style === 'long'
    ? longDateFormat.format(isoString)
    : mediumDateFormat.format(isoString)
}
