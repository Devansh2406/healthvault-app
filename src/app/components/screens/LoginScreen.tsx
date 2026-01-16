import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useApp } from '@/app/context/AppContext';
import { useTranslation } from '@/app/hooks/useTranslation';

export function LoginScreen() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const { t } = useTranslation();
  const [step, setStep] = useState<'login' | 'profile'>('login');
  const [phone, setPhone] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    city: '',
    conditions: [] as string[],
  });

  const conditions = ['Diabetes', 'Hypertension', 'Asthma', 'None'];

  const toggleCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  const handleGetOTP = () => {
    if (phone.length === 10) {
      setStep('profile');
    }
  };

  const handleComplete = () => {
    setUser({
      phoneNumber: phone, // Save the phone number
      age: parseInt(formData.age),
      gender: formData.gender,
      city: formData.city,
      conditions: formData.conditions,
      language: 'en',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Emergency Disclaimer Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 text-sm mb-1">{t('emergency_disclaimer')}</h3>
            <p className="text-xs text-green-700">
              {t('emergency_text')}
            </p>
          </div>
        </div>
        <a href="tel:108">
          <Button className="w-full mt-3 bg-[#00D66C] hover:bg-[#00bf5f] text-white h-10 rounded-full">
            Call 108
          </Button>
        </a>
      </div>

      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {step === 'profile' && (
            <button onClick={() => setStep('login')} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-xl font-bold">{t('profile_settings')}</h1>
        </div>

        {step === 'login' ? (
          <div className="space-y-6">
            {/* Logo */}
            <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#00D66C]" />
            </div>

            {/* Welcome Text */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('welcome_title')}
              </h2>
              <p className="text-sm text-green-600">
                {t('welcome_subtitle')}
              </p>
            </div>

            {/* Mobile Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">{t('mobile_number')}</label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 h-14 border border-gray-200">
                <span className="text-gray-600 text-sm">+91</span>
                <input
                  type="tel"
                  placeholder="00000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 bg-transparent outline-none text-base"
                />
              </div>
            </div>

            <Button
              onClick={handleGetOTP}
              disabled={phone.length !== 10}
              className="w-full h-14 bg-[#00D66C] hover:bg-[#00bf5f] text-white rounded-xl text-base font-semibold"
            >
              {t('get_otp')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Details Header */}
            <div className="text-center py-2">
              <p className="text-xs font-semibold text-green-600 tracking-wider">{t('profile_details')}</p>
            </div>

            {/* Age and Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('age')}</label>
                <input
                  type="number"
                  placeholder="Years"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-gray-50 rounded-xl px-4 h-14 border border-gray-200 outline-none focus:border-[#00D66C]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t('gender')}</label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="h-14 bg-gray-50 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Male" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('male')}</SelectItem>
                    <SelectItem value="female">{t('female')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">{t('city')}</label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 h-14 border border-gray-200">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Delhi..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="flex-1 bg-transparent outline-none text-base"
                />
              </div>
            </div>

            {/* Health Conditions */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900">
                {t('health_conditions')}
              </label>
              <div className="flex flex-wrap gap-2">
                {conditions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${formData.conditions.includes(condition)
                      ? 'bg-green-50 border-[#00D66C] text-green-700'
                      : 'bg-white border-gray-200 text-gray-700'
                      }`}
                  >
                    {condition}
                  </button>
                ))}
                <button className="px-4 py-2 rounded-full border-2 border-gray-200 text-sm font-medium text-gray-700">
                  + Add Other
                </button>
              </div>
            </div>

            {/* Complete Profile Button */}
            <Button
              onClick={handleComplete}
              disabled={!formData.age || !formData.gender || !formData.city}
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-base font-semibold"
            >
              {t('complete_profile')}
            </Button>

            {/* Terms Text */}
            <p className="text-xs text-center text-gray-500 leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="#" className="text-green-600 underline">Terms of Service</a> and{' '}
              <a href="#" className="text-green-600 underline">Privacy Policy</a>. Data is stored securely as per Indian Health Standards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
