import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: 'vi' | 'en';
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'dark';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'default',
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize current language code (e.g., 'vi-VN' -> 'vi', default 'vi')
  const currentLangCode = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === currentLangCode) || LANGUAGES[0];

  const handleSelectLanguage = (code: 'vi' | 'en') => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          variant === 'dark'
            ? 'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-inverse-on-surface hover:text-white hover:bg-white/10 text-body-sm transition-colors cursor-pointer select-none'
            : 'inline-flex items-center justify-center gap-2 h-9 px-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface transition-all cursor-pointer shadow-2xs'
        }
        aria-label="Chọn ngôn ngữ"
        title="Chọn ngôn ngữ / Select Language"
      >
        {variant === 'dark' ? (
          <>
            <span className="material-symbols-outlined text-[15px] opacity-80">language</span>
            <span className="font-medium text-xs leading-none">{currentLanguage.label}</span>
            <span className="material-symbols-outlined text-[14px] opacity-70 leading-none">
              {isOpen ? 'expand_less' : 'expand_more'}
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase leading-tight">
              {currentLanguage.code}
            </span>
            <span className="hidden sm:inline leading-none font-medium">
              {currentLanguage.label}
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant leading-none">
              {isOpen ? 'expand_less' : 'expand_more'}
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-lg py-1 z-50 animate-fade-in">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase">
                    {lang.code}
                  </span>
                  <span className="leading-none">{lang.label}</span>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-[16px] text-primary leading-none">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

