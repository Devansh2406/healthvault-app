# Translation Implementation Guide

## ✅ Completed Screens
The following screens have been updated with full translation support:

1. **BottomNav** - Navigation labels translate
2. **ProfileScreen** - All text translates
3. **LoginScreen** - Complete translation support

## 📝 How to Apply to Remaining Screens

For each remaining screen, follow these 3 steps:

### Step 1: Import the hook
```tsx
import { useTranslation } from '@/app/hooks/useTranslation';
```

### Step 2: Use the hook in your component
```tsx
export function YourScreen() {
  const { t } = useTranslation();
  // ... rest of component
}
```

### Step 3: Replace hardcoded text
```tsx
// Before:
<h1>Upload Report</h1>
<button>Save</button>
<p>Emergency Disclaimer</p>

// After:
<h1>{t('upload_report')}</h1>
<button>{t('save')}</button>
<p>{t('emergency_disclaimer')}</p>
```

## 🎯 Screens Still Needing Translation

### Priority 1 (Most Visible):
- [ ] **HomeScreen** - Main landing page
- [ ] **ReportsVaultScreen** - Report list
- [ ] **RemindersScreen** - Health reminders

### Priority 2 (Frequently Used):
- [ ] **ReportUploadScreen** - Upload interface
- [ ] **EditProfileScreen** - Profile editing
- [ ] **AssistantScreen** - AI assistant

### Priority 3 (Less Frequent):
- [ ] **NearbyScreen** - Hospital finder
- [ ] **TestExplanationScreen** - Test details
- [ ] **RiskResultScreen** - Risk assessment

## 📚 Available Translation Keys

All translation keys are defined in `src/app/lib/i18n.ts`. Here are the most commonly used:

### Navigation
- `home`, `nearby`, `assistant`, `vault`, `profile`

### Actions
- `upload_report`, `save`, `save_changes`, `cancel`, `back`
- `submit`, `edit`, `delete`, `view`, `download`

### Profile
- `age`, `gender`, `city`, `mobile_number`
- `edit_profile`, `logout`

### Medical
- `blood_tests`, `hemoglobin`, `blood_sugar`
- `risk_level`, `findings`, `symptoms`

### Emergency
- `emergency_disclaimer`, `call_108`, `emergency_text`

## 🌐 How Language Switching Works

1. User goes to **Profile** → **Language**
2. Selects "हिंदी (Hindi)" from dropdown
3. Language preference saves to localStorage
4. All screens using `t()` function automatically update
5. Preference persists across page reloads

## 🔧 Testing

To test translations:
1. Run the app: `npm run dev`
2. Navigate to Profile screen
3. Change language to Hindi
4. Navigate through the app
5. All translated screens should show Hindi text

## 📌 Notes

- TypeScript errors about module declarations are IDE warnings only
- The app will work fine despite these warnings
- All translations are in `src/app/lib/i18n.ts`
- The hook is in `src/app/hooks/useTranslation.ts`
