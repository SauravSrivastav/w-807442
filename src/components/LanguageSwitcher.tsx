import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={i18n.language === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 h-auto ${i18n.language === 'en' ? 'text-wikitok-red' : 'text-white'}`}
      >
        EN
      </Button>
      <Button
        variant={i18n.language === 'hi' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('hi')}
        className={`px-2 py-1 h-auto ${i18n.language === 'hi' ? 'text-wikitok-red' : 'text-white'}`}
      >
        HI
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
