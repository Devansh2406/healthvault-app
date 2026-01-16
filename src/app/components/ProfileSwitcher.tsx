import { useState } from 'react';
import {
    ChevronDown,
    Plus,
    Settings,
    Trash2,
    Edit2,
    Check
} from 'lucide-react';
import { useApp, Profile } from '@/app/context/AppContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/app/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

import { Badge } from '@/app/components/ui/badge';

export function ProfileSwitcher() {
    const {
        profiles,
        activeProfile,
        activeProfileId,
        switchProfile,
        addProfile,
        updateProfile,
        deleteProfile
    } = useApp();

    const [isManageOpen, setIsManageOpen] = useState(false);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({ name: '', relation: 'Other' });

    const relations = ["Self", "Father", "Mother", "Spouse", "Child", "Brother", "Sister", "Grandparent", "Other"];

    const handleOpenAdd = () => {
        setFormData({ name: '', relation: 'Other' });
        setEditingId(null);
        setView('form');
    };

    const handleOpenEdit = (profile: Profile) => {
        setFormData({ name: profile.name, relation: profile.relation });
        setEditingId(profile.id);
        setView('form');
    };

    const handleSave = () => {
        if (!formData.name.trim()) return;

        if (editingId) {
            updateProfile(editingId, formData);
        } else {
            addProfile({
                id: Date.now().toString(),
                name: formData.name,
                relation: formData.relation
            });
        }
        // Return to list
        setView('list');
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure? All health data for this profile will be permanently deleted.")) {
            deleteProfile(id);
        }
    };

    const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : '??';

    // Helper to determine avatar color based on relation/index
    const getAvatarColor = (relation: string) => {
        switch (relation?.toLowerCase()) {
            case 'self': return 'bg-teal-100 text-teal-700';
            case 'father': return 'bg-blue-100 text-blue-700';
            case 'mother': return 'bg-rose-100 text-rose-700';
            case 'spouse': return 'bg-purple-100 text-purple-700';
            case 'child': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 pl-2 pr-3 gap-2 rounded-full border-gray-200 hover:bg-gray-50 bg-white cursor-pointer transition-colors shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(activeProfile?.relation || '')}`}>
                            {getInitials(activeProfile?.name || '??')}
                        </div>
                        <div className="flex flex-col items-start min-w-[60px]">
                            <span className="text-xs font-bold text-gray-900 leading-none truncate max-w-[80px]">{activeProfile?.name || 'Guest'}</span>
                            <span className="text-[9px] text-gray-500 leading-none mt-0.5">{activeProfile?.relation || 'User'}</span>
                        </div>
                        <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-xl p-2 z-[60]">
                    <DropdownMenuLabel className="text-xs text-gray-400 font-normal uppercase tracking-wider px-2">Switch Profile</DropdownMenuLabel>

                    <div className="space-y-1 mt-1 max-h-[300px] overflow-y-auto">
                        {profiles.map(profile => (
                            <DropdownMenuItem
                                key={profile.id}
                                onSelect={() => switchProfile(profile.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${activeProfileId === profile.id ? 'bg-teal-50 text-teal-900' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${getAvatarColor(profile.relation)}`}>
                                    {getInitials(profile.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{profile.name}</p>
                                    <p className="text-xs opacity-70 truncate">{profile.relation}</p>
                                </div>
                                {activeProfileId === profile.id && <Check className="w-4 h-4 text-teal-500 shrink-0" />}
                            </DropdownMenuItem>
                        ))}
                    </div>

                    <DropdownMenuSeparator className="my-2 bg-gray-100" />

                    <DropdownMenuItem
                        onSelect={() => {
                            setIsManageOpen(true);
                            handleOpenAdd();
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer text-teal-700 hover:bg-teal-50"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed border-teal-200 bg-teal-50 text-teal-600">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1 font-medium text-sm">Add Family Member</div>
                        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-teal-200 text-[10px] h-5 px-1.5">New</Badge>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => {
                            setIsManageOpen(true);
                            setView('list');
                        }}
                        className="p-2 justify-center text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer mt-1"
                    >
                        <Settings className="w-3 h-3 mr-2" />
                        Manage All Profiles
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Manage Dialog - explicitly outside the menu structure */}
            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent className="sm:max-w-md bg-gray-50 p-0 overflow-hidden rounded-2xl z-[100]">
                    {view === 'list' ? (
                        <>
                            <div className="bg-white p-4 border-b">
                                <DialogHeader>
                                    <DialogTitle>Family Members</DialogTitle>
                                    <DialogDescription>Manage profiles for your family health vault.</DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
                                {profiles.map(profile => (
                                    <div key={profile.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${getAvatarColor(profile.relation)}`}>
                                                {getInitials(profile.name)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{profile.name}</p>
                                                <p className="text-xs text-gray-500">{profile.relation}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => handleOpenEdit(profile)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            {profiles.length > 1 && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(profile.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-white border-t mt-auto">
                                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2" onClick={handleOpenAdd}>
                                    <Plus className="w-4 h-4" /> Add Family Member
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white p-4 border-b">
                                <DialogHeader>
                                    <DialogTitle>{editingId ? 'Edit Profile' : 'New Profile'}</DialogTitle>
                                </DialogHeader>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Rahul Sharma"
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Relation</Label>
                                    <Select
                                        value={formData.relation}
                                        onValueChange={val => setFormData({ ...formData, relation: val })}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[110]">
                                            {relations.map(rel => (
                                                <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t mt-auto flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setView('list')}>Cancel</Button>
                                <Button className="flex-1 bg-teal-600 text-white hover:bg-teal-700" onClick={handleSave}>Save Profile</Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
