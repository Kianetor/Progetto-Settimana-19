const EURO = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const NUMERO = new Intl.NumberFormat('it-IT')
const DATA = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' })

export const euro = (valore) => EURO.format(Number(valore))
export const km = (valore) => `${NUMERO.format(valore)} km`
export const data = (iso) => (iso ? DATA.format(new Date(iso)) : '')

export const ALIMENTAZIONI = {
  BENZINA: 'Benzina',
  DIESEL: 'Diesel',
  GPL: 'GPL',
  METANO: 'Metano',
  IBRIDA: 'Ibrida',
  ELETTRICA: 'Elettrica',
}

// Un'immagine si usa solo se è https: il backend lo controlla già, qui è una seconda difesa
export const immagineSicura = (url) => (typeof url === 'string' && url.startsWith('https://') ? url : null)
