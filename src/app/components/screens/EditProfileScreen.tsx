
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Activity, Calendar, Save, Phone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent } from '@/app/components/ui/card';
import { useApp } from '@/app/context/AppContext';

export function EditProfileScreen() {
    const navigate = useNavigate();
    const { user, setUser } = useApp();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        age: user?.age || '',
        gender: user?.gender || '',
        city: user?.city || '',
        conditions: user?.conditions ? user.conditions.join(', ') : ''
    });

    const handleSave = () => {
        setUser({
            ...user,
            name: formData.name,
            phoneNumber: user?.phoneNumber, // Preserve phone number
            age: Number(formData.age),
            gender: formData.gender,
            city: formData.city,
            conditions: formData.conditions.split(',').map(c => c.trim()).filter(c => c),
            language: user?.language || 'en'
        });
        navigate('/profile');
    };

    return (
        <div className="min-h-screen bg-[#f5f7fa] pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate('/profile')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            </div>

            <div className="p-6 space-y-6">

                {/* Personal Details */}
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" /> Personal Details
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {/* Phone Number Display (Read Only) */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400">REGISTERED MOBILE</Label>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="font-mono text-gray-600 font-medium tracking-wide">
                                        {'XXX ' + (user?.phoneNumber?.slice(-4) || 'Unknown')}
                                    </span>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded ml-auto">Verified</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">My Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="font-bold text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    placeholder="e.g. 35"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <Input
                                    id="city"
                                    className="pl-9"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="e.g. Mumbai"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Health Profile */}
                <Card className="border-none shadow-sm bg-white rounded-2xl">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-500" /> Health Profile
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="conditions">Existing Conditions (Comma separated)</Label>
                            <Input
                                id="conditions"
                                value={formData.conditions}
                                onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                                placeholder="e.g. Diabetes, Hypertension"
                            />
                            <p className="text-xs text-gray-500">Used to provide personalized health insights</p>
                        </div>
                    </CardContent>
                </Card>

                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg shadow-lg shadow-blue-200" onClick={handleSave}>
                    <Save className="w-5 h-5 mr-2" /> Save Changes
                </Button>

            </div>
        </div>
    );
}
