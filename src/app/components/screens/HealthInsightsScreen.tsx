import { useState, useMemo } from 'react';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    FileText,
    Plus,
    Share2,
    Download,
    ChevronLeft,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { format, subDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { motion } from 'motion/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/app/components/ui/drawer';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useApp, HealthMetric } from '@/app/context/AppContext';
import { BottomNav } from '@/app/components/BottomNav';

const METRICS = {
    sugar: { label: 'Blood Glucose', unit: 'mg/dL', color: '#10B981', domain: [60, 200] },
    bp_sys: { label: 'Systolic BP', unit: 'mmHg', color: '#F59E0B', domain: [90, 180] },
    bp_dia: { label: 'Diastolic BP', unit: 'mmHg', color: '#3B82F6', domain: [50, 120] },
    weight: { label: 'Weight', unit: 'kg', color: '#8B5CF6', domain: [40, 150] },
    thyroid: { label: 'TSH', unit: 'mIU/L', color: '#EC4899', domain: [0, 10] },
};

export function HealthInsightsScreen() {
    const navigate = useNavigate();
    const { vitals, addVital, deleteVital, reports } = useApp();

    const [selectedMetric, setSelectedMetric] = useState<keyof typeof METRICS>('sugar');
    const [timeRange, setTimeRange] = useState('1m'); // 7d, 1m, 3m, 6m, 1y

    // Drawer State
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [newVital, setNewVital] = useState<Partial<HealthMetric>>({
        type: 'sugar',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        value: 0
    });

    // Filter Data based on selection and time range
    const chartData = useMemo(() => {
        const now = new Date();
        let daysToSubtract = 30;
        if (timeRange === '7d') daysToSubtract = 7;
        if (timeRange === '3m') daysToSubtract = 90;
        if (timeRange === '6m') daysToSubtract = 180;
        if (timeRange === '1y') daysToSubtract = 365;

        const startDate = subDays(now, daysToSubtract);

        // Filter vitals
        const filtered = vitals
            .filter(v => v.type === selectedMetric && new Date(v.date) >= startDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return filtered.map(v => ({
            date: format(parseISO(v.date), 'MMM d'),
            fullDate: v.date,
            value: v.value,
            notes: v.notes,
            source: v.source
        }));
    }, [vitals, selectedMetric, timeRange]);

    // Insights Logic
    const insight = useMemo(() => {
        if (chartData.length < 2) return { status: 'stable', text: 'Not enough data to show trends.' };

        const last = chartData[chartData.length - 1].value;
        const prev = chartData[chartData.length - 2].value;
        const diff = last - prev;
        const percent = ((diff / prev) * 100).toFixed(1);

        if (Math.abs(diff) < 2) return { status: 'stable', text: 'Your levels are stable compared to last reading.' };
        if (diff > 0) return { status: 'increased', text: `Increased by ${percent}% since last reading.` };
        return { status: 'decreased', text: `Decreased by ${percent}% since last reading.` };
    }, [chartData]);

    const handleAddVital = () => {
        if (!newVital.value || !newVital.date) return;

        addVital({
            id: Date.now().toString(),
            type: newVital.type as any,
            value: Number(newVital.value),
            unit: METRICS[newVital.type as keyof typeof METRICS].unit,
            date: newVital.date,
            time: newVital.time,
            source: 'manual',
            notes: newVital.notes
        });

        setIsAddDrawerOpen(false);
        setNewVital({
            type: 'sugar',
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm'),
            value: 0
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const currentMetricConfig = METRICS[selectedMetric];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 print:bg-white print:pb-0">
            <style>
                {`
                @media print {
                    @page { margin: 20px; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print, .sticky, button, nav, .bottom-nav { display: none !important; }
                    .print-only { display: block !important; }
                    .shadow-lg, .shadow-sm { box-shadow: none !important; border: 1px solid #eee; }
                    .bg-gray-50 { background-color: white !important; }
                    .min-h-screen { min-height: auto !important; }
                }
                .print-only { display: none; }
                `}
            </style>

            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-6 rounded-b-[2rem] shadow-sm sticky top-0 z-10 print:static print:shadow-none print:pt-4 print:px-0">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-gray-100 no-print">
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Health Trends</h1>
                            <p className="hidden print-only text-sm text-gray-500">Generated on {format(new Date(), 'PPP')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 no-print">
                        <Button variant="outline" size="icon" className="rounded-full" onClick={handlePrint}>
                            <Download className="w-5 h-5 text-gray-600" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Share2 className="w-5 h-5 text-gray-600" />
                        </Button>
                    </div>
                </div>

                {/* Metric Selector */}
                <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 no-scrollbar no-print">
                    {Object.entries(METRICS).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedMetric(key as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedMetric === key
                                ? `bg-[${config.color}] text-white shadow-lg shadow-[${config.color}]/30`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            style={{
                                backgroundColor: selectedMetric === key ? config.color : undefined
                            }}
                        >
                            <Activity className="w-4 h-4" />
                            <span className="font-medium text-sm">{config.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Chart Card */}
                <Card className="border-none shadow-lg bg-white rounded-3xl overflow-hidden print:rounded-none print:border">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-gray-500 text-sm font-medium uppercase tracking-wider">{currentMetricConfig.label}</CardTitle>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {chartData.length > 0 ? chartData[chartData.length - 1].value : '--'}
                                    </span>
                                    <span className="text-gray-500 font-medium">{currentMetricConfig.unit}</span>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${insight.status === 'stable' ? 'bg-gray-100 text-gray-600' :
                                insight.status === 'increased' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                }`}>
                                {insight.status === 'stable' ? <Minus className="w-3 h-3" /> :
                                    insight.status === 'increased' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span className="capitalize">{insight.status}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={currentMetricConfig.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={currentMetricConfig.color} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide
                                        domain={currentMetricConfig.domain}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        cursor={{ stroke: currentMetricConfig.color, strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={currentMetricConfig.color}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorMetric)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Time Range Tabs */}
                        <div className="flex justify-between bg-gray-50 p-1 rounded-xl mt-6 no-print">
                            {['7d', '1m', '3m', '6m', '1y'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {range.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {chartData.length > 0 && (
                            <p className="text-xs text-gray-500 mt-4 text-center bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                {insight.text}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Timeline Section */}
            <div className="px-6 mt-6 print:px-0 print:mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">History & Context</h2>
                    <Button variant="ghost" className="text-teal-600 text-sm font-bold no-print" onClick={() => setIsAddDrawerOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" /> Add Reading
                    </Button>
                </div>

                <div className="space-y-4">
                    {chartData.slice().reverse().map((item, idx) => (
                        <div key={idx} className="flex gap-4 relative break-inside-avoid">
                            {/* Timeline Line */}
                            <div className="flex flex-col items-center">
                                <div className={`w-3 h-3 rounded-full border-2 border-[${currentMetricConfig.color}] bg-white z-10`} style={{ borderColor: currentMetricConfig.color }} />
                                {idx !== chartData.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 -my-1" />}
                            </div>

                            <div className="pb-6 flex-1 print:pb-2">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <span className="text-sm font-bold text-gray-900">{format(parseISO(item.fullDate), 'MMMM d, yyyy')}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${item.source === 'manual' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
                                                    {item.source}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold" style={{ color: currentMetricConfig.color }}>
                                            {item.value} <span className="text-xs text-gray-400 font-normal">{currentMetricConfig.unit}</span>
                                        </span>
                                    </div>
                                    {item.notes && (
                                        <p className="text-gray-500 text-sm mt-2 bg-gray-50 p-2 rounded-lg italic">
                                            "{item.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {chartData.length === 0 && (
                        <div className="text-center py-10 opacity-50">
                            <Activity className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                            <p>No data recorded for this period.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Add FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddDrawerOpen(true)}
                className="fixed bottom-24 right-5 w-14 h-14 bg-teal-600 rounded-full shadow-lg shadow-teal-600/30 flex items-center justify-center text-white z-40 no-print"
            >
                <Plus className="w-7 h-7" />
            </motion.button>

            {/* Add Metric Drawer */}
            <Drawer open={isAddDrawerOpen} onOpenChange={setIsAddDrawerOpen}>
                <DrawerContent className="no-print">
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle className="text-center text-xl font-bold">Add New Reading</DrawerTitle>
                        </DrawerHeader>

                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Metric Type</Label>
                                <Select
                                    value={newVital.type}
                                    onValueChange={(val: any) => setNewVital({ ...newVital, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(METRICS).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Value ({METRICS[newVital.type as keyof typeof METRICS]?.unit})</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={newVital.value}
                                        onChange={e => setNewVital({ ...newVital, value: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={newVital.date}
                                        onChange={e => setNewVital({ ...newVital, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Context / Notes (Optional)</Label>
                                <Input
                                    placeholder="e.g. After breakfast, Feeling dizzy..."
                                    value={newVital.notes || ''}
                                    onChange={e => setNewVital({ ...newVital, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <DrawerFooter>
                            <Button onClick={handleAddVital} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12">
                                Save Reading
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline" className="rounded-xl">Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            <div className="no-print">
                <BottomNav />
            </div>
        </div>
    );
}
