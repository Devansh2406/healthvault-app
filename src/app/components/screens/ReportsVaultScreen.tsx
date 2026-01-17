import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Search,
  Star,
  FileText,
  Clock,
  Plus,
  Calendar as CalendarIcon,
  ArrowUpDown,
  X,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  ListFilter,
  Edit2,
  Check,
  MoreVertical,
  Pencil,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameDay } from 'date-fns';

import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/app/components/ui/dropdown-menu';
import { Calendar } from '@/app/components/ui/calendar';
import { useApp, Report } from '@/app/context/AppContext';
import { BottomNav } from '@/app/components/BottomNav';
import { ProfileSwitcher } from '@/app/components/ProfileSwitcher';

// Local type extending Report with processed fields
type ProcessedReport = Report & {
  displayTags: string[];
  dateObj: Date;
  isStarred: boolean;
  isReviewed: boolean;
};

export function ReportsVaultScreen() {
  const navigate = useNavigate();
  const { reports, editReport, deleteReport, vitals } = useApp();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showUnreviewedOnly, setShowUnreviewedOnly] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProcessedReport | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');


  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Effect to manage file preview URL
  useEffect(() => {
    if (selectedReport?.file) {
      const url = URL.createObjectURL(selectedReport.file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedReport]);

  // New Features State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [summaryMode, setSummaryMode] = useState(false);

  // Sorting & Filtering State
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const categories = ['All', 'Blood', 'Biochemistry', 'Hormones', 'Imaging', 'Prescription'];

  // Enhanced Processing: Filter & Sort
  const processedReports = useMemo(() => {
    let filtered = reports.map(r => ({
      ...r,
      // Handle date parsing safely - fallback to current date if invalid
      dateObj: r.date ? new Date(r.date) : new Date(),
      isStarred: r.starred || false,
      isReviewed: r.reviewed || false,
      displayTags: r.tags || [],
    }));

    // Filter by Category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(r =>
        r.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
        r.name.toLowerCase().includes(activeCategory.toLowerCase())
      );
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    // Filter by Specific Date
    if (dateFilter) {
      filtered = filtered.filter(r => isSameDay(r.dateObj, dateFilter));
    }

    // Quick Filters
    if (showStarredOnly) {
      filtered = filtered.filter(r => r.isStarred);
    }
    if (showUnreviewedOnly) {
      filtered = filtered.filter(r => !r.isReviewed);
    }

    // Sort by Date
    return filtered.sort((a, b) => {
      const timeA = a.dateObj.getTime();
      const timeB = b.dateObj.getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [reports, activeCategory, searchQuery, showStarredOnly, showUnreviewedOnly, sortOrder, dateFilter]);

  // Group by Month (Respecting Sort Order)
  const groupedReports = useMemo(() => {
    // We use an array of objects to preserve order: [{ title: "JANUARY 2026", reports: [...] }, ...]
    const groups: { title: string; reports: typeof processedReports }[] = [];
    const groupMap = new Map<string, typeof processedReports>();
    const groupOrder: string[] = [];

    processedReports.forEach(report => {
      if (!isNaN(report.dateObj.getTime())) {
        const monthYear = format(report.dateObj, 'MMMM yyyy').toUpperCase();

        if (!groupMap.has(monthYear)) {
          groupMap.set(monthYear, []);
          groupOrder.push(monthYear);
        }
        groupMap.get(monthYear)?.push(report);
      }
    });

    return groupOrder.map(title => ({
      title,
      reports: groupMap.get(title) || []
    }));
  }, [processedReports]);

  // Actions
  const handleToggleStar = (e: React.MouseEvent, id: string, current: boolean) => {
    e.stopPropagation();
    editReport(id, { starred: !current });
  };

  const openPreview = (report: ProcessedReport, startEditing = false) => {
    if (isSelectionMode) {
      toggleSelection(report.id);
      return;
    }
    setSelectedReport(report);
    setEditedTitle(report.name);
    setIsEditingTitle(startEditing);
    setIsPreviewOpen(true);
    setSummaryMode(false); // Reset summary mode
    // Mark as reviewed when opened
    if (!report.reviewed) {
      editReport(report.id, { reviewed: true });
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this report?')) {
      deleteReport(id);
    }
  };

  const handleSaveTitle = () => {
    if (selectedReport && editedTitle.trim()) {
      editReport(selectedReport.id, { name: editedTitle });
      setSelectedReport(prev => prev ? { ...prev, name: editedTitle } : null);
      setIsEditingTitle(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getIconForCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('blood')) return { icon: '🩸', color: 'bg-red-100 text-red-600' };
    if (n.includes('sugar') || n.includes('glucose')) return { icon: '🍬', color: 'bg-orange-100 text-orange-600' };
    if (n.includes('heart') || n.includes('cardio')) return { icon: '❤️', color: 'bg-rose-100 text-rose-600' };
    if (n.includes('prescription')) return { icon: '💊', color: 'bg-blue-100 text-blue-600' };
    return { icon: '📋', color: 'bg-gray-100 text-gray-600' };
  };

  // Helper to get formatted vitals for comparison/summary
  const getReportVitals = (reportId: string) => {
    return vitals.filter(v => v.reportId === reportId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* Top Header */}
      <div className="bg-white sticky top-0 z-20 px-4 py-3 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <UserIcon className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden xs:block">Vault</h1>
            <div className="ml-2">
              <ProfileSwitcher />
            </div>
          </div>

          <div className="flex gap-2">
            {/* Selection Mode Toggle */}
            <Button
              variant={isSelectionMode ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className={`rounded-full ${isSelectionMode ? 'bg-teal-600 text-white' : 'text-gray-600'}`}
            >
              <ArrowRightLeft className="w-5 h-5" />
            </Button>

            {/* Filter/Sort Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className={`p-2 rounded-full transition-colors ${dateFilter || sortOrder === 'oldest' ? 'bg-teal-50 text-teal-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                  {dateFilter ? <CalendarIcon className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 mx-4 md:mr-4 rounded-2xl shadow-xl border-gray-100" align="end">
                <div className="space-y-4">
                  {/* Sort Toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-gray-700">Sort Order</span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setSortOrder('newest')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortOrder === 'newest' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                      >
                        Newest
                      </button>
                      <button
                        onClick={() => setSortOrder('oldest')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${sortOrder === 'oldest' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                      >
                        Oldest
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Date Filter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Filter by Date</span>
                      {dateFilter && (
                        <Button variant="ghost" size="sm" onClick={() => setDateFilter(undefined)} className="h-6 px-2 text-red-500 hover:text-red-600 text-xs">
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="border rounded-xl p-1 bg-white">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                        className="rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary/20 transition-all rounded-xl text-sm"
              placeholder="Search reports, dates, tags..."
            />
          </div>
          <Button
            variant={showStarredOnly ? "default" : "outline"}
            size="icon"
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`w-10 h-10 rounded-xl ${showStarredOnly ? 'bg-yellow-400 hover:bg-yellow-500 border-yellow-400 text-white' : 'border-gray-200 text-gray-500'}`}
          >
            <Star className={`w-4 h-4 ${showStarredOnly ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white/80 backdrop-blur-md sticky top-[88px] z-10 border-b border-gray-100">
        <div className="flex overflow-x-auto px-4 py-2 gap-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === cat
                ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-blue-50/50 border-blue-100 p-3 rounded-2xl flex items-center gap-3" onClick={() => setShowUnreviewedOnly(!showUnreviewedOnly)}>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Unreviewed</p>
              <p className="text-lg font-bold text-gray-900">{reports.filter(r => !r.reviewed).length}</p>
            </div>
          </Card>
          <Card className="bg-purple-50/50 border-purple-100 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-bold uppercase tracking-wide">Favorites</p>
              <p className="text-lg font-bold text-gray-900">{reports.filter(r => r.starred).length}</p>
            </div>
          </Card>
        </div>

        {/* Reports Timeline */}
        {groupedReports.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No reports found</h3>
            <p className="text-gray-500 text-sm">Upload a report or adjust your filters.</p>
          </div>
        ) : (
          groupedReports.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">{group.title}</h3>

              <div className="space-y-3">
                {group.reports.map((report) => {
                  const style = getIconForCategory(report.name);
                  const isSelected = selectedIds.includes(report.id);

                  return (
                    <motion.div
                      key={report.id}
                      onClick={() => openPreview(report)}
                      layoutId={report.id}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left bg-white p-4 rounded-2xl shadow-sm border transition-all relative overflow-hidden group cursor-pointer ${isSelected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-gray-100 hover:shadow-md'
                        }`}
                    >
                      {/* Selection Checkbox (Visible in Selection Mode) */}
                      {isSelectionMode && (
                        <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-gray-300 bg-white'
                          }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      )}

                      {/* Review Status Indicator (Hidden in Selection Mode) */}
                      {!report.isReviewed && !isSelectionMode && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full shadow-sm shadow-blue-200" />
                      )}

                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${style.color} flex items-center justify-center text-xl flex-shrink-0`}>
                          {style.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-900 text-base truncate pr-2">{report.name}</h4>

                            {/* Actions Area */}
                            {!isSelectionMode && (
                              <div className="flex items-center gap-1 -mt-1 ml-2" onClick={e => e.stopPropagation()}>
                                {/* Star Button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 rounded-full ${report.isStarred ? 'text-yellow-400 bg-yellow-50' : 'text-gray-300 hover:text-gray-400 hover:bg-gray-50'}`}
                                  onClick={(e) => handleToggleStar(e, report.id, report.isStarred)}
                                >
                                  <Star className={`w-4 h-4 ${report.isStarred ? 'fill-current' : ''}`} />
                                </Button>

                                {/* More Options Menu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-full">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="rounded-xl w-40">
                                    <DropdownMenuItem onSelect={() => openPreview(report, true)}>
                                      <Pencil className="w-4 h-4 mr-2" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                      onSelect={(e) => handleDelete(report.id, e as any)}
                                    >
                                      <Trash className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className="bg-gray-50 text-gray-500 font-normal text-[10px] hover:bg-gray-100">
                              {report.category}
                            </Badge>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">{report.date}</span>

                            {/* Auto Tags Display */}
                            {report.displayTags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-[10px] h-5 px-1.5 border-teal-100 text-teal-600 bg-teal-50">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {report.notes && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">
                              "{report.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compare Action Button */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.length === 2 && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
          >
            <Button
              onClick={() => setIsComparisonOpen(true)}
              className="rounded-full shadow-xl bg-gray-900 hover:bg-black text-white px-6 h-12 flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Compare Reports
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload FAB (Hidden in Selection Mode) */}
      {!isSelectionMode && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/upload')}
          className="fixed bottom-24 right-5 w-14 h-14 bg-teal-600 rounded-full shadow-lg shadow-teal-600/30 flex items-center justify-center text-white z-40"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      )}

      {/* Comparison Dialog */}
      <Dialog open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
        <DialogContent className="max-w-[800px] h-[80vh] flex flex-col p-0">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <DialogTitle>Report Comparison</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsComparisonOpen(false)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-8 h-full">
              {selectedIds.map((id, index) => {
                const report = reports.find(r => r.id === id);
                const vitalsList = getReportVitals(id);
                if (!report) return null;

                return (
                  <div key={id} className="space-y-4">
                    <div className="border-b pb-4">
                      <Badge variant="outline" className="mb-2">{index === 0 ? 'Earlier Report' : 'Later Report'}</Badge>
                      <h3 className="font-bold text-lg">{report.name}</h3>
                      <p className="text-sm text-gray-500">{report.date}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase">Extracted Values</h4>
                      {vitalsList.length > 0 ? (
                        vitalsList.map(v => {
                          // Diff logic: Find same metric in other report
                          const otherId = selectedIds.find(oid => oid !== id);
                          const otherVitals = otherId ? getReportVitals(otherId) : [];
                          const match = otherVitals.find(ov => ov.type === v.type);
                          const isDifferent = match && match.value !== v.value;

                          return (
                            <div key={v.id} className={`flex justify-between p-3 rounded-lg border ${isDifferent ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                              <span className="capitalize text-sm font-medium text-gray-700">{v.type.replace('_', ' ')}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{v.value} <span className="text-xs font-normal text-gray-500">{v.unit}</span></span>
                                {isDifferent && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-400 italic">No extracted values found.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[400px] rounded-3xl p-0 overflow-hidden bg-gray-50 max-h-[85vh] flex flex-col">
          {selectedReport && (
            <>
              <div className="p-6 bg-white border-b border-gray-100">
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-2xl ${getIconForCategory(selectedReport.name).color} flex items-center justify-center text-xl mb-4`}>
                      {getIconForCategory(selectedReport.name).icon}
                    </div>

                    <div className="flex gap-2">
                      {/* Toggle Summary Mode */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`rounded-full ${summaryMode ? 'bg-teal-50 text-teal-600' : 'text-gray-400'}`}
                        onClick={() => setSummaryMode(!summaryMode)}
                      >
                        <ListFilter className="w-5 h-5" />
                      </Button>
                      <Badge className={selectedReport.reviewed ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                        {selectedReport.reviewed ? 'Reviewed' : 'New Report'}
                      </Badge>
                    </div>

                  </div>

                  {/* Editable Title Section */}
                  <div className="flex items-center gap-2 mt-2">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="h-9 font-bold text-lg"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle();
                            if (e.key === 'Escape') setIsEditingTitle(false);
                          }}
                        />
                        <Button size="icon" className="h-9 w-9 shrink-0 bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveTitle}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => setIsEditingTitle(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group w-full">
                        <DialogTitle className="text-xl font-bold truncate pr-2">{selectedReport.name}</DialogTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-teal-600 hover:bg-teal-50"
                          onClick={() => {
                            setEditedTitle(selectedReport.name);
                            setIsEditingTitle(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <DialogDescription>
                    Uploaded on {selectedReport.date} • {selectedReport.category}
                  </DialogDescription>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedReport.displayTags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] bg-gray-100 text-gray-600">#{tag}</Badge>
                    ))}
                  </div>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {summaryMode ? (
                  // Doctor-Friendly Summary View
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase">Clinical Summary</h3>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                      {getReportVitals(selectedReport.id).length > 0 ? (
                        getReportVitals(selectedReport.id).map(v => (
                          <div key={v.id} className="p-3 flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium capitalize">{v.type.replace('_', ' ')}</span>
                            <span className="text-sm font-bold text-gray-900">{v.value} {v.unit}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          No structured data available for summary.
                        </div>
                      )}
                    </div>

                    {selectedReport.notes && (
                      <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                        <p className="text-xs font-bold text-yellow-700 mb-1">NOTES</p>
                        <p className="text-sm text-gray-700">{selectedReport.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase">Type</p>
                        <p className="font-semibold text-gray-800">{selectedReport.category}</p>
                      </div>
                      <div className="bg-white p-3 rounded-2xl border border-gray-100">
                        <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                        <p className="font-semibold text-gray-800">{selectedReport.reviewed ? 'Archived' : 'Important'}</p>
                      </div>
                    </div>

                    {/* AI Analysis Mock */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">AI Summary</h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedReport.summary || "No specific summary available for this report. The values seem consistent with previous records."}
                      </p>
                    </div>

                    {/* File Preview Mock */}
                    {/* File Preview */}
                    <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 min-h-[300px] flex flex-col relative group">
                      {previewUrl ? (
                        <>
                          {selectedReport.file?.type.includes('image') ? (
                            <img
                              src={previewUrl}
                              alt="Report Preview"
                              className="w-full h-auto object-contain max-h-[500px]"
                            />
                          ) : selectedReport.file?.type.includes('pdf') ? (
                            <div className="w-full h-[500px]">
                              <iframe
                                src={previewUrl}
                                title="PDF Preview"
                                className="w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-10 h-full">
                              <FileText className="w-16 h-16 text-gray-400 mb-4" />
                              <p className="text-gray-500 font-medium">Preview not available for this file type.</p>
                              <p className="text-xs text-gray-400 mt-1">({selectedReport.file?.type || 'Unknown Type'})</p>
                            </div>
                          )}

                          {/* Download Button Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <a
                              href={previewUrl}
                              download={selectedReport.name}
                              className="pointer-events-auto bg-white text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              Download File
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-600 font-medium">No file attached</p>
                          <p className="text-sm text-gray-400 mt-1">This record was created without a document.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 text-base" onClick={() => setIsPreviewOpen(false)}>
                  Close Preview
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
