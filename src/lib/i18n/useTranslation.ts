'use client';

import { useMapStore } from '@/store/useMapStore';
import { translations, Language, TranslationDictionary } from './translations';

export function useTranslation(): {
  t: TranslationDictionary;
  language: Language;
  setLanguage: (lang: Language) => void;
} {
  const language = useMapStore((state) => state.language);
  const setLanguage = useMapStore((state) => state.setLanguage);

  return {
    t: translations[language] || translations.vi,
    language,
    setLanguage,
  };
}
