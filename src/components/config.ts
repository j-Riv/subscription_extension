import dotenv from 'dotenv';
dotenv.config();

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
export const serverUrl = process.env.SHOPIFY_APP_SERVER_URL;
