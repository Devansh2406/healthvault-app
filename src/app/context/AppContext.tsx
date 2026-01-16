import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

// DB Configuration
const DB_NAME = 'HealthVaultDB';
const DB_VERSION = 2; // Incremented for schema changes if needed, though we store simple objects
const STORE_NAME = 'reports';

// IndexDB Utility
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
};

interface User {
  name?: string;
  phoneNumber?: string;
  age?: number;
  gender?: string;
  city?: string;
  conditions?: string[];
  language: 'en' | 'hi';
}

export interface Profile {
  id: string;
  name: string;
  relation: string; // "Self", "Father", "Mother", "Child", "Spouse", "Other"
  avatar?: string;
  themeColor?: string; // Optional for UI distinction
}

interface Report {
  id: string;
  profileId?: string; // Added for Family Profile
  name: string;
  category: string;
  date: string;
  file?: File;
  analysis?: string;
  medicines?: string[];
  keyFindings?: string[];
  summary?: string;
  starred?: boolean;
  reviewed?: boolean;
  tags?: string[];
  notes?: string;
}

interface Reminder {
  id: string;
  profileId?: string; // Added for Family Profile
  testName: string;
  nextDueDate: string;
  frequency: string;
  type: 'sugar' | 'bp' | 'lipid' | 'other';
  enabled: boolean;
}

export interface CalendarEvent {
  id: string;
  profileId?: string; // Added for Family Profile
  title: string;
  type: 'appointment' | 'test' | 'medication' | 'follow-up';
  date: string; // ISO Date YYYY-MM-DD
  time?: string;
  location?: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'missed';
  linkedReportId?: string;
}

export interface HealthMetric {
  id: string;
  profileId?: string; // Added for Family Profile
  type: 'sugar' | 'bp_sys' | 'bp_dia' | 'weight' | 'cholesterol' | 'thyroid' | 'hemoglobin' | 'other';
  value: number;
  unit: string;
  date: string;
  time?: string;
  source: 'manual' | 'report' | 'device';
  reportId?: string;
  notes?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;

  // Profile Management
  profiles: Profile[];
  activeProfile: Profile | undefined;
  activeProfileId: string;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  switchProfile: (id: string) => void;

  reports: Report[];
  addReport: (report: Report) => Promise<void>;
  editReport: (id: string, updates: Partial<Report>) => void;
  deleteReport: (id: string) => Promise<void>;

  reminders: Reminder[];
  toggleReminder: (id: string) => void;
  addReminder: (reminder: Reminder) => void;
  editReminder: (id: string, updates: Partial<Reminder>) => void;

  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  editEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  vitals: HealthMetric[];
  addVital: (vital: HealthMetric) => void;
  deleteVital: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // --- USER STATE ---
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('healthvault_user');
    return savedUser ? JSON.parse(savedUser) : { language: 'en' };
  });

  // --- PROFILE STATE ---
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const savedProfiles = localStorage.getItem('healthvault_profiles');
    if (savedProfiles) return JSON.parse(savedProfiles);
    return [{ id: 'self', name: 'My Health', relation: 'Self' }];
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    // Default to first profile if none saved, or 'self'
    return localStorage.getItem('healthvault_active_profile') || 'self';
  });

  const activeProfile = useMemo(() =>
    profiles.find(p => p.id === activeProfileId) || profiles[0]
    , [profiles, activeProfileId]);

  // Persist Profile State
  useEffect(() => {
    localStorage.setItem('healthvault_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('healthvault_active_profile', activeProfileId);
  }, [activeProfileId]);

  // --- RAW DATA STATE (Contains ALL data for ALL profiles) ---
  const [allReports, setAllReports] = useState<Report[]>([]); // Loaded from DB
  const [allReminders, setAllReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('healthvault_reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('healthvault_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [allVitals, setAllVitals] = useState<HealthMetric[]>(() => {
    const saved = localStorage.getItem('healthvault_vitals');
    // Initialize mock data if empty and add profileId 'self' to legacy data if needed
    if (saved) return JSON.parse(saved);
    return [];
  });

  // --- DATABASE SYNC ---
  useEffect(() => {
    const loadReports = async () => {
      try {
        const db = await initDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          if (request.result.length === 0) {
            // Mock Data for new users
            const defaults = [
              { id: '1', profileId: 'self', name: 'Complete Blood Count', category: 'Blood Tests', date: '2025-01-10' },
              { id: '2', profileId: 'self', name: 'Lipid Profile', category: 'Biochemistry', date: '2025-01-08' },
            ];
            setAllReports(defaults);
          } else {
            // BACKWARD COMPATIBILITY: Ensure loaded reports have a profileId if missing
            const validReports = request.result.map((r: any) => ({
              ...r,
              profileId: r.profileId || 'self'
            }));
            setAllReports(validReports);
          }
        };
      } catch (err) {
        console.error("Failed to load reports from DB", err);
      }
    };
    loadReports();
  }, []);

  // Persist Non-DB Data
  useEffect(() => { localStorage.setItem('healthvault_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('healthvault_reminders', JSON.stringify(allReminders)); }, [allReminders]);
  useEffect(() => { localStorage.setItem('healthvault_events', JSON.stringify(allEvents)); }, [allEvents]);
  useEffect(() => { localStorage.setItem('healthvault_vitals', JSON.stringify(allVitals)); }, [allVitals]);

  // --- FILTERED DATA (Based on Active Profile) ---
  const reports = useMemo(() => allReports.filter(r => (r.profileId || 'self') === activeProfileId), [allReports, activeProfileId]);

  const reminders = useMemo(() => {
    // If no remimders exist yet, show defaults for 'self' only once
    if (allReminders.length === 0 && activeProfileId === 'self') {
      return [
        { id: '1', profileId: 'self', testName: 'Sugar Test (Fasting)', frequency: 'Daily', nextDueDate: 'Oct 24, 08:00 AM', type: 'sugar', enabled: true },
        { id: '2', profileId: 'self', testName: 'Blood Pressure Check', frequency: 'Twice Daily', nextDueDate: 'Oct 24, 06:00 PM', type: 'bp', enabled: true },
      ] as Reminder[];
    }
    return allReminders.filter(r => (r.profileId || 'self') === activeProfileId);
  }, [allReminders, activeProfileId]);

  const events = useMemo(() => {
    if (allEvents.length === 0 && activeProfileId === 'self') {
      return [
        { id: '1', profileId: 'self', title: 'Dr. Sharma Consultation', type: 'appointment', date: '2026-01-20', time: '10:00', location: 'City Hospital', status: 'upcoming', notes: 'Follow up' },
      ] as CalendarEvent[];
    }
    return allEvents.filter(e => (e.profileId || 'self') === activeProfileId);
  }, [allEvents, activeProfileId]);

  const vitals = useMemo(() => {
    if (allVitals.length === 0 && activeProfileId === 'self') {
      return [
        { id: '1', profileId: 'self', type: 'sugar', value: 95, unit: 'mg/dL', date: '2026-01-10', time: '08:00', source: 'manual' },
        { id: '5', profileId: 'self', type: 'bp_sys', value: 120, unit: 'mmHg', date: '2026-01-10', time: '09:00', source: 'manual' },
      ] as HealthMetric[];
    }
    return allVitals.filter(v => (v.profileId || 'self') === activeProfileId);
  }, [allVitals, activeProfileId]);

  // --- ACTIONS ---

  // Profile Management
  const addProfile = (profile: Profile) => {
    setProfiles([...profiles, profile]);
    setActiveProfileId(profile.id); // Auto-switch to new
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles(profiles.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProfile = async (id: string) => {
    const newProfiles = profiles.filter(p => p.id !== id);

    if (newProfiles.length === 0) {
      // Ensure at least one profile exists
      const defaultProfile: Profile = { id: 'self', name: 'My Health', relation: 'Self' };
      setProfiles([defaultProfile]);
      setActiveProfileId('self');
    } else {
      setProfiles(newProfiles);
      if (activeProfileId === id) {
        setActiveProfileId(newProfiles[0].id);
      }
    }

    // Cleanup State Data
    setAllReports(prev => prev.filter(r => r.profileId !== id));
    setAllReminders(prev => prev.filter(r => r.profileId !== id));
    setAllEvents(prev => prev.filter(e => e.profileId !== id));
    setAllVitals(prev => prev.filter(v => v.profileId !== id));

    // Cleanup IndexedDB (Reports)
    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          if (cursor.value.profileId === id) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    } catch (err) {
      console.error("Failed to cleanup DB for profile", id, err);
    }
  };

  const switchProfile = (id: string) => {
    setActiveProfileId(id);
  };

  // Report Actions
  const addReport = async (report: Report) => {
    // Auto-Tagging
    const nextTags = new Set(report.tags || []);
    const searchText = (report.name + " " + report.category + " " + (report.analysis || "")).toLowerCase();

    if (searchText.includes('blood') || searchText.includes('cbc')) nextTags.add('Blood');
    if (searchText.includes('sugar') || searchText.includes('glucose')) nextTags.add('Diabetes');
    if (searchText.includes('lipid') || searchText.includes('cholesterol')) nextTags.add('Heart');
    if (searchText.includes('thyroid')) nextTags.add('Thyroid');
    if (searchText.includes('prescription')) nextTags.add('Prescription');

    // Attach Profile ID
    const finalReport = {
      ...report,
      tags: Array.from(nextTags),
      profileId: activeProfileId
    };

    setAllReports(prev => [finalReport, ...prev]);

    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put(finalReport);
    } catch (err) {
      console.error("Failed to save report to DB", err);
    }
  };

  const editReport = async (id: string, updates: Partial<Report>) => {
    const updatedReports = allReports.map(r => r.id === id ? { ...r, ...updates } : r);
    setAllReports(updatedReports);

    try {
      const report = updatedReports.find(r => r.id === id);
      if (report) {
        const db = await initDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.put(report);
      }
    } catch (err) {
      console.error("Failed to update report in DB", err);
    }
  };

  const deleteReport = async (id: string) => {
    const newReports = allReports.filter(r => r.id !== id);
    setAllReports(newReports);

    try {
      const db = await initDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
    } catch (err) {
      console.error("Failed to delete report from DB", err);
    }
  };

  // Reminder Actions
  const toggleReminder = (id: string) => {
    setAllReminders(allReminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };
  const addReminder = (reminder: Reminder) => {
    setAllReminders([...allReminders, { ...reminder, profileId: activeProfileId }]);
  };
  const editReminder = (id: string, updates: Partial<Reminder>) => {
    setAllReminders(allReminders.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // Event Actions
  const addEvent = (event: CalendarEvent) => {
    setAllEvents([...allEvents, { ...event, profileId: activeProfileId }]);
  };
  const editEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setAllEvents(allEvents.map(e => e.id === id ? { ...e, ...updates } : e));
  };
  const deleteEvent = (id: string) => {
    setAllEvents(allEvents.filter(e => e.id !== id));
  };

  // Vital Actions
  const addVital = (vital: HealthMetric) => {
    setAllVitals([...allVitals, { ...vital, profileId: activeProfileId }]);
  };
  const deleteVital = (id: string) => {
    setAllVitals(allVitals.filter(v => v.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,

        profiles,
        activeProfile,
        activeProfileId,
        addProfile,
        updateProfile,
        deleteProfile,
        switchProfile,

        reports, // Returns only filtered reports
        addReport,
        editReport,
        deleteReport,

        reminders, // Returns only filtered reminders
        toggleReminder,
        addReminder,
        editReminder,

        events,
        addEvent,
        editEvent,
        deleteEvent,

        vitals,
        addVital,
        deleteVital,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
