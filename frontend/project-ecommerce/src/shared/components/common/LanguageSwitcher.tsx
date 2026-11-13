import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: 'vi' | 'en';
  shortLabel: string;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'vi', shortLabel: 'VN', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', shortLabel: 'EN', label: 'English', flag: '🇬🇧' },
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

  // Chuẩn hóa mã ngôn ngữ (e.g., 'vi-VN' -> 'vi', mặc định 'vi')
  const currentLangCode = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === currentLangCode) || LANGUAGES[0];

  const handleSelectLanguage = (code: 'vi' | 'en') => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Đóng dropdown khi click ra ngoài
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
            ? 'flex items-center gap-1 text-inverse-on-surface hover:text-white transition-colors cursor-pointer select-none text-body-sm font-body-sm leading-none'
            : 'inline-flex items-center justify-center gap-2 h-7.5 sm:h-8 px-3 rounded-[12px] border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 transition-all cursor-pointer shadow-2xs select-none'
        }
        aria-label="Chọn ngôn ngữ"
        title="Chọn ngôn ngữ / Select Language"
      >
        {variant === 'dark' ? (
          <>
            <span className="material-symbols-outlined text-[15px]">language</span>
            <span>{currentLanguage.label}</span>
            <span className="material-symbols-outlined text-[15px] opacity-75 leading-none">
              {isOpen ? 'expand_less' : 'expand_more'}
            </span>
          </>
        ) : (
          <>
            <span className="font-bold text-slate-900 text-xs sm:text-[13px] tracking-tight leading-none">
              {currentLanguage.shortLabel}
            </span>
            <span className="font-medium text-slate-800 text-xs sm:text-[13px] leading-none">
              {currentLanguage.label}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-slate-700 transition-transform duration-200 leading-none shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant/60 shadow-xl py-1 z-50 animate-fade-in">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLangCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface hover:bg-surface-container font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface text-xs">
                    {lang.shortLabel}
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
