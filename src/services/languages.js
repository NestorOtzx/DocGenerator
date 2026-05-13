export const DOCUMENTATION_LANGUAGES = [
  language('en', 'English'),
  language('es', 'Spanish'),
  language('fr', 'French'),
  language('de', 'German'),
  language('it', 'Italian'),
  language('pt-BR', 'Portuguese (Brazil)'),
  language('pt-PT', 'Portuguese (Portugal)'),
  language('nl', 'Dutch'),
  language('pl', 'Polish'),
  language('tr', 'Turkish'),
  language('ru', 'Russian'),
  language('uk', 'Ukrainian'),
  language('ja', 'Japanese'),
  language('ko', 'Korean'),
  language('zh-CN', 'Chinese (Simplified)'),
  language('zh-TW', 'Chinese (Traditional)'),
  language('ar', 'Arabic'),
  language('hi', 'Hindi'),
  language('id', 'Indonesian'),
  language('vi', 'Vietnamese'),
];

export function getDefaultLanguageCode() {
  return DOCUMENTATION_LANGUAGES[0].code;
}

export function getLanguage(languageCode) {
  return DOCUMENTATION_LANGUAGES.find((languageItem) => languageItem.code === languageCode)
    ?? DOCUMENTATION_LANGUAGES[0];
}

function language(code, name) {
  return { code, name };
}
