import { useApp } from '../context/AppContext';
import { translations } from '@/app/lib/i18n';

export function useTranslation() {
    const { user } = useApp();
    const currentLang = user?.language || 'en';

    const t = (key: string): string => {
        const dict = translations[currentLang as keyof typeof translations] || translations['en'];
        return (dict as any)[key] || key;
    };

    return { t, currentLang };
}
