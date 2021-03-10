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

// This is tempororary will move for production
export const serverUrl = 'https://eab73c93d01c.ngrok.io';
