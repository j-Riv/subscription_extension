export interface Translations {
  [key: string]: string;
}

export const translations: {
  [locale: string]: Translations;
} = {
  de: {
    hello: 'Guten Tag',
  },
  en: {
    hello: 'Hello',
  },
  fr: {
    hello: 'Bonjour',
  },
};

export const serverUrl = 'https://eab73c93d01c.ngrok.io';
