import * as path from 'path';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';

export const i18nConfig = {
  fallbackLanguage: 'en',
  loaderOptions: {
    path: path.join(__dirname, '../config/i18n/'),
    watch: true,
  },
  resolvers: [
    {
      use: QueryResolver,
      options: ['lang'],
    },
    new HeaderResolver(['x-custom-lang']),
    new CookieResolver(),
    new AcceptLanguageResolver(),
  ],
}; 