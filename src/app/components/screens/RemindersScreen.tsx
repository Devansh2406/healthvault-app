import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  FileText,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  Stethoscope,
  TestTube,
  Pill,
  MoreVertical,
  X
} from 'lucide-react';
import { format, parseISO, isSameDay, addDays, startOfToday } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

// UI Components
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/app/components/ui/drawer';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

import { useApp, CalendarEvent } from '@/app/context/AppContext';
import { BottomNav } from '@/app/components/BottomNav';

export function RemindersScreen() {
  const { events, addEvent, editEvent, deleteEvent, reminders } = useApp();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Drawer State for Add/Edit Event
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form State
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({
    type: 'appointment',
    status: 'upcoming',
    date: format(new Date(), 'yyyy-MM-dd'),
    recurrence: 'none'
  });

  const selectedDateEvents = events.filter(event =>
    date && isSameDay(parseISO(event.date), date)
  );

  const upcomingEvents = events
    .filter(e => e.status === 'upcoming' && new Date(e.date) >= startOfToday())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3); // Top 3 next events

  const handleDaySelect = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  const openAddEvent = () => {
    setEditingEventId(null);
    setEventForm({
      type: 'appointment',
      status: 'upcoming',
      date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      title: '',
      location: '',
      notes: ''
    });
    setIsDrawerOpen(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setEventForm({ ...event });
    setIsDrawerOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title || !eventForm.date) return;

    const baseEventData = {
      id: editingEventId || Date.now().toString(),
      title: eventForm.title,
      type: eventForm.type || 'appointment',
      date: eventForm.date,
      time: eventForm.time,
      location: eventForm.location,
      notes: eventForm.notes,
      status: eventForm.status || 'upcoming',
      linkedReportId: eventForm.linkedReportId,
      recurrence: eventForm.recurrence,
      frequency: eventForm.frequency,
      customTimes: eventForm.customTimes,
      daysOfWeek: eventForm.daysOfWeek
    } as CalendarEvent;

    // Handle Generation for Recurring Medication
    if (eventForm.type === 'medication' && eventForm.recurrence !== 'none' && !editingEventId) {
      const generatedEvents: CalendarEvent[] = [];
      const startDate = parseISO(eventForm.date!);
      const durationDays = 30; // Default schedule for 30 days

      for (let i = 0; i < durationDays; i++) {
        const currentDate = addDays(startDate, i);
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        let shouldAdd = false;

        if (eventForm.recurrence === 'daily') {
          shouldAdd = true;
        } else if (eventForm.recurrence === 'weekly' && eventForm.daysOfWeek?.includes(currentDate.getDay())) {
          shouldAdd = true;
        }

        if (shouldAdd) {
          // Handle Multiple Times a Day
          if (eventForm.customTimes && eventForm.customTimes.length > 0) {
            eventForm.customTimes.forEach((time, index) => {
              generatedEvents.push({
                ...baseEventData,
                id: `${Date.now()}-${i}-${index}`,
                date: dateStr,
                time: time
              });
            });
          } else {
            generatedEvents.push({
              ...baseEventData,
              id: `${Date.now()}-${i}`,
              date: dateStr
            });
          }
        }
      }

      // Batch add (simulate by calling addEvent multiple times for now, ideally context should have addEvents)
      generatedEvents.forEach(e => addEvent(e));
      setIsDrawerOpen(false);
      return;
    }

    if (editingEventId) {
      editEvent(editingEventId, baseEventData);
    } else {
      addEvent(baseEventData);
    }

    setIsDrawerOpen(false);
  };

  const handleDeleteEvent = () => {
    if (editingEventId) {
      deleteEvent(editingEventId);
      setIsDrawerOpen(false);
    }
  };

  // Status Icons Helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'missed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Circle className="w-5 h-5 text-blue-500" />;
    }
  };

  // Type Icons Helper
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Stethoscope className="w-4 h-4" />;
      case 'test': return <TestTube className="w-4 h-4" />;
      case 'medication': return <Pill className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-700';
      case 'test': return 'bg-purple-100 text-purple-700';
      case 'medication': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleToggleStatus = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    const newStatus = event.status === 'completed' ? 'upcoming' : 'completed';
    editEvent(event.id, { status: newStatus });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* Header */}
      <div className="bg-white p-6 pb-4 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Medical Calendar</h1>
          <Button size="icon" variant="ghost" className="rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={openAddEvent}>
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Calendar Component */}
        <div className="bg-white rounded-xl">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDaySelect}
            className="rounded-md border-none w-full flex justify-center p-0"
            classNames={{
              day_selected: "bg-teal-500 text-white hover:bg-teal-600 focus:bg-teal-600",
              day_today: "bg-gray-100 text-gray-900 font-bold",
            }}
            modifiers={{
              hasEvent: (date) => events.some(e => isSameDay(parseISO(e.date), date))
            }}
            modifiersStyles={{
              hasEvent: { fontWeight: 'bold', textDecoration: 'underline decoration-teal-500 decoration-2 underline-offset-4' }
            }}
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Selected Date Events */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center justify-between">
            <span>{date ? format(date, 'MMMM d, yyyy') : 'Select a date'}</span>
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {selectedDateEvents.length} Events
            </span>
          </h2>

          <div className="space-y-3">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">No events for this day</p>
                <Button variant="link" onClick={openAddEvent} className="text-teal-600">Add Event</Button>
              </div>
            ) : (
              selectedDateEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card
                    className="border-none shadow-sm bg-white rounded-2xl overflow-hidden active:scale-95 transition-transform relative group"
                  >
                    {/* Click Overlay for Edit Mode */}
                    <div
                      onClick={() => openEditEvent(event)}
                      className="absolute inset-0 z-10 cursor-pointer"
                    />

                    <CardContent className="p-4 flex gap-4 relative">
                      {/* Time Column */}
                      <div className="flex flex-col items-center justify-center min-w-[3rem] border-r border-gray-100 pr-4">
                        <span className="text-sm font-bold text-gray-900">{event.time || '--:--'}</span>
                        <span className="text-xs text-gray-400 capitalize">{event.type}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-bold text-gray-900 ${event.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                            {event.title}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(e, event)}
                            className="p-2 -mr-3 rounded-full hover:bg-gray-100 transition-colors cursor-pointer relative z-20"
                          >
                            {getStatusIcon(event.status)}
                          </button>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}

                        {event.notes && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-1 bg-gray-50 p-1.5 rounded-md">
                            "{event.notes}"
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Regular Reminders / Recurring */}
        {reminders.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Recurring Reminders</h2>
            <div className="grid grid-cols-2 gap-3">
              {reminders.filter(r => r.enabled).map(r => (
                <div key={r.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.type === 'sugar' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {r.type === 'sugar' ? <Clock className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 line-clamp-1">{r.testName}</p>
                    <p className="text-xs text-gray-500">{r.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Event Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[85vh]">
          <div className="mx-auto w-full max-w-sm h-full flex flex-col">
            <DrawerHeader>
              <DrawerTitle className="text-2xl font-bold text-center">
                {editingEventId ? 'Edit Event' : 'New Event'}
              </DrawerTitle>
            </DrawerHeader>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Title */}
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  placeholder="e.g. Cardiologist Visit"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </div>

              {/* Type Grid */}
              <div className="grid grid-cols-3 gap-2">
                {['appointment', 'test', 'medication'].map(t => (
                  <button
                    key={t}
                    onClick={() => setEventForm({ ...eventForm, type: t as any })}
                    className={`p-2 rounded-lg border text-sm capitalize flex flex-col items-center gap-1 transition-all ${eventForm.type === t
                      ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {getTypeIcon(t)}
                    {t}
                  </button>
                ))}
              </div>

              {/* Medication Frequency Options */}
              {eventForm.type === 'medication' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 border border-blue-50 bg-blue-50/50 p-3 rounded-xl">
                  <div className="space-y-2">
                    <Label className="text-blue-700">Frequency</Label>
                    <Select
                      value={eventForm.recurrence || 'none'}
                      onValueChange={(val: any) => setEventForm({ ...eventForm, recurrence: val })}
                    >
                      <SelectTrigger className="bg-white border-blue-200">
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Once Only</SelectItem>
                        <SelectItem value="daily">Daily (for 30 days)</SelectItem>
                        <SelectItem value="weekly">Weekly / Specific Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Days for Weekly */}
                  {eventForm.recurrence === 'weekly' && (
                    <div className="space-y-2">
                      <Label className="text-blue-700">Select Days</Label>
                      <div className="flex gap-2 justify-between">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const currentDays = eventForm.daysOfWeek || [];
                              const newDays = currentDays.includes(idx)
                                ? currentDays.filter(day => day !== idx)
                                : [...currentDays, idx];
                              setEventForm({ ...eventForm, daysOfWeek: newDays });
                            }}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${eventForm.daysOfWeek?.includes(idx)
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border text-gray-500 hover:bg-blue-50'
                              }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multiple Times Logic */}
                  {(eventForm.recurrence === 'daily' || eventForm.recurrence === 'weekly') && (
                    <div className="space-y-2">
                      <Label className="text-blue-700">Times per Day</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`justify-start ${!eventForm.customTimes?.length ? 'border-blue-500 bg-blue-100 text-blue-800' : 'bg-white'}`}
                          onClick={() => setEventForm({ ...eventForm, customTimes: [] })} // Default uses main time
                        >
                          Once at {eventForm.time || 'selected time'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`justify-start ${eventForm.customTimes?.length === 2 ? 'border-blue-500 bg-blue-100 text-blue-800' : 'bg-white'}`}
                          onClick={() => setEventForm({ ...eventForm, customTimes: ['09:00', '21:00'] })}
                        >
                          Twice (Morning 9am, Night 9pm)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`justify-start ${eventForm.customTimes?.length === 3 ? 'border-blue-500 bg-blue-100 text-blue-800' : 'bg-white'}`}
                          onClick={() => setEventForm({ ...eventForm, customTimes: ['09:00', '14:00', '21:00'] })}
                        >
                          3 Times (Morning, Afternoon, Night)
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={eventForm.time}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="e.g. City Hospital, Room 302"
                    value={eventForm.location}
                    onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add details, symptoms, or questions..."
                  className="resize-none h-24"
                  value={eventForm.notes || ''}
                  onChange={e => setEventForm({ ...eventForm, notes: e.target.value })}
                />
              </div>

              {/* Status (Only if editing) */}
              {editingEventId && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <Label>Status</Label>
                  <Select
                    value={eventForm.status}
                    onValueChange={(val: any) => setEventForm({ ...eventForm, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DrawerFooter className="border-t border-gray-100 pt-4">
              <Button onClick={handleSaveEvent} className="bg-teal-600 hover:bg-teal-700 text-white w-full h-12 rounded-xl text-lg">
                {editingEventId ? 'Save Changes' : 'Create Event'}
              </Button>
              {editingEventId && (
                <Button variant="destructive" onClick={handleDeleteEvent} className="w-full">
                  Delete Event
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline" className="w-full">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <BottomNav />
    </div>
  );
}
