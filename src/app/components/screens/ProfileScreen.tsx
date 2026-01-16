import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Globe, Trash2, LogOut, Shield, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useApp } from '@/app/context/AppContext';
import { BottomNav } from '@/app/components/BottomNav';
import { useTranslation } from '@/app/hooks/useTranslation';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-24">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{t('profile_settings')}</h1>
            <p className="text-xs text-gray-500">{t('manage_account')}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* User Info Card */}
        <Card className="bg-white rounded-2xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{user?.name || t('user_profile')}</h3>
                <p className="text-sm text-gray-500">{user?.phoneNumber ? `+91 ${user.phoneNumber}` : t('no_number')}</p>
              </div>
            </div>
            {user && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{t('age')}</p>
                  <p className="font-semibold text-gray-900">{user.age || t('not_set')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">{t('gender')}</p>
                  <p className="font-semibold text-gray-900 capitalize">{user.gender || t('not_set')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl col-span-2">
                  <p className="text-xs text-gray-500 mb-1">{t('city')}</p>
                  <p className="font-semibold text-gray-900">{user.city || t('not_set')}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Language Selection */}
        <Card className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">{t('language')}</h3>
            </div>
            <Select
              value={user?.language || 'en'}
              onValueChange={(value) => setUser({ ...user, language: value as 'en' | 'hi' })}
            >
              <SelectTrigger className="h-12 bg-gray-50 border-gray-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="hi">{t('hindi')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Health Conditions */}
        {user?.conditions && user.conditions.length > 0 && (
          <Card className="border-2 border-gray-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3">{t('existing_conditions')}</h3>
              <div className="flex flex-wrap gap-2">
                {user.conditions.map((condition) => (
                  <span
                    key={condition}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Options */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full h-14 justify-between border-2"
            onClick={() => navigate('/edit-profile')}
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <span>{t('edit_profile')}</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 justify-between border-2"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <span className="text-red-600">{t('delete_all_data')}</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Big Disclaimer */}
        <Card className="bg-yellow-50 border-4 border-yellow-400">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2 text-lg">{t('important_disclaimer')}</h3>
                <div className="space-y-2 text-sm text-yellow-900">
                  <p>
                    <span className="font-semibold">{t('disclaimer_text')}</span>
                  </p>
                  <p>
                    {t('disclaimer_education')}
                  </p>
                  <p>
                    {t('disclaimer_physician')}
                  </p>
                  <p className="font-semibold">
                    {t('disclaimer_emergency')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-14 border-2 border-gray-300 text-gray-700"
          onClick={() => navigate('/login')}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t('logout')}
        </Button>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Swasthya Sathi v1.0</p>
          <p className="text-xs mt-1">{t('made_with_love')}</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}