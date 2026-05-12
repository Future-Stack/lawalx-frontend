'use client';

import { useState } from 'react';
import { Plus, Search, Calendar, Shield, Trash2, Edit, Eye, EyeOff, Clock, User, Mail, X, ChevronDown, Check } from 'lucide-react';
import BaseDialog from '@/common/BaseDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetAllEmployeesQuery, useCreateEmployeeMutation, useUpdateEmployeeMutation } from '@/redux/api/admin/profile&settings/userRoleApi';
import { toast } from 'sonner';
import { getUrl } from '@/lib/content-utils';
import Image from 'next/image';

type Role = 'Super Admin' | 'Admin' | 'Sales Staff' | 'Support Staff' | 'Supporter';

interface Employee {
    id?: string | number;
    name: string;
    email: string;
    role: string;
    lastLogin: string;
    avatar?: string;
    status?: string;
}

// Custom Dropdown Component
function CustomSelect({ options, placeholder, value, onChange, className, multiple = false, disabled = false }: any) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (val: string) => {
        if (disabled) return;
        if (multiple) {
            const newValue = Array.isArray(value) ? [...value] : [];
            if (newValue.includes(val)) {
                onChange(newValue.filter(v => v !== val));
            } else {
                onChange([...newValue, val]);
            }
        } else {
            onChange(val);
            setIsOpen(false);
        }
    };

    const getDisplayText = () => {
        if (multiple) {
            if (!Array.isArray(value) || value.length === 0) return placeholder;
            return options
                .filter((opt: any) => value.includes(opt.value))
                .map((opt: any) => opt.label)
                .join(', ');
        }
        const selectedOption = options.find((opt: any) => opt.value === value);
        return selectedOption ? selectedOption.label : placeholder;
    };

    const isSelected = (val: string) => {
        if (multiple) {
            return Array.isArray(value) && value.includes(val);
        }
        return value === val;
    };

    return (
        <div className="relative w-full">
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 h-11 bg-navbarBg border rounded-lg text-sm transition-all focus:ring-2 focus:ring-bgBlue/30 cursor-pointer ${className} ${isOpen ? 'border-bgBlue' : 'border-border'} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                <span className={(multiple ? (Array.isArray(value) && value.length > 0) : value) ? "text-headings font-medium line-clamp-1 text-left" : "text-gray-400 line-clamp-1 text-left"}>
                    {getDisplayText()}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-bgBlue' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[1000]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 w-full mt-1 bg-navbarBg border border-border rounded-lg shadow-xl z-[1001] max-h-60 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100 scrollbar-hide">
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSelect(opt.value)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${isSelected(opt.value) ? 'bg-bgBlue/10 dark:bg-bgBlue/20 text-bgBlue font-bold' : 'text-headings'}`}
                            >
                                <span>{opt.label}</span>
                                {isSelected(opt.value) && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function ProfileAvatar({ imageUrl, name, size = 'lg' }: { imageUrl: string | null | undefined; name: string; size?: 'sm' | 'lg' }) {
    const initials = name
        ? name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '';

    const sizeClasses = size === 'lg'
        ? 'w-24 h-24 text-2xl'
        : 'w-10 h-10 text-sm';

    const resolvedUrl = getUrl(imageUrl || null);

    if (resolvedUrl) {
        return (
            <div className={`relative ${sizeClasses} rounded-full overflow-hidden border border-border shadow-sm flex-shrink-0`}>
                <Image src={resolvedUrl} alt={name} fill className="object-cover" sizes={size === 'lg' ? '96px' : '40px'} />
            </div>
        );
    }

    return (
        <div className={`${sizeClasses} rounded-full border border-border shadow-sm flex-shrink-0 bg-gradient-to-br from-bgBlue to-blue-700 flex items-center justify-center`}>
            {initials ? (
                <span className="font-bold text-white uppercase">{initials}</span>
            ) : (
                <User className={size === 'lg' ? 'w-10 h-10 text-white' : 'w-5 h-5 text-white'} />
            )}
        </div>
    );
}

export default function UsersRolesSection() {
    const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // API Hooks
    const { data: employeesData, isLoading: isLoadingEmployees } = useGetAllEmployeesQuery(undefined);
    const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
    const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();

    // Modal Form State
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        password: string;
        role: string;
        supporterRole: string;
        skills: string[];
    }>({
        name: '',
        email: '',
        password: '',
        role: '',
        supporterRole: '',
        skills: []
    });

    const handleInputChange = (field: string, value: any) => {
        if (viewOnly) return;
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setViewOnly(false);
        setCurrentUser(null);
        setFormData({ name: '', email: '', password: '', role: '', supporterRole: '', skills: [] });
        setErrors({});
        setAddEmployeeOpen(true);
    };

    const handleOpenEditModal = (emp: any) => {
        setIsEditing(true);
        setViewOnly(false);
        setCurrentUser(emp);
        setFormData({
            name: emp.user?.username || emp.user?.full_name || '',
            email: emp.user?.account?.email || '',
            password: '••••••••', // Placeholder
            role: emp.user?.role === 'ADMIN' ? 'Admin' : 'Supporter',
            supporterRole: emp.supporterRole?.[0] || '',
            skills: emp.skills || []
        });
        setErrors({});
        setAddEmployeeOpen(true);
    };

    const handleOpenViewModal = (emp: any) => {
        setIsEditing(false);
        setViewOnly(true);
        setCurrentUser(emp);
        setFormData({
            name: emp.user?.username || emp.user?.full_name || '',
            email: emp.user?.account?.email || '',
            password: '••••••••',
            role: emp.user?.role === 'ADMIN' ? 'Admin' : 'Supporter',
            supporterRole: emp.supporterRole?.[0] || '',
            skills: emp.skills || []
        });
        setErrors({});
        setAddEmployeeOpen(true);
    };

    const handleSubmit = async () => {
        if (viewOnly) {
            setAddEmployeeOpen(false);
            return;
        }

        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = "Name is required";

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!isEditing) {
            if (!formData.password) {
                newErrors.password = "Password is required";
            } else if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }
        } else {
            // In edit mode, password is optional — but if provided it must be valid
            if (formData.password && formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }
        }

        if (!formData.role) newErrors.role = "Role is required";

        if (formData.role === 'Supporter') {
            if (!formData.supporterRole) newErrors.supporterRole = "Supporter role is required";
            if (formData.skills.length === 0) newErrors.skills = "At least one skill is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (isEditing && currentUser) {
                const patchData: any = {
                    username: formData.name,
                };
                // Only send password if admin has filled it in
                if (formData.password && formData.password.trim() !== '' && formData.password !== '••••••••') {
                    patchData.password = formData.password;
                }
                if (formData.role === 'Supporter') {
                    patchData.supporterRole = [formData.supporterRole];
                    patchData.skills = formData.skills;
                }

                const res = await updateEmployee({ id: currentUser.id, data: patchData }).unwrap();
                if (res.success) {
                    toast.success(res.message || "Employee updated successfully");
                    setAddEmployeeOpen(false);
                }
                return;
            }

            const payload: any = {
                username: formData.name,
                email: formData.email,
                password: formData.password,
                employeeRole: formData.role.toUpperCase(),
            };

            if (formData.role === 'Supporter') {
                payload.supporterRole = [formData.supporterRole];
                payload.skills = formData.skills;
            }

            const res = await createEmployee(payload).unwrap();
            if (res.success) {
                toast.success(res.message || "Employee created successfully");
                setAddEmployeeOpen(false);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Something went wrong");
        }
    };

    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case 'Super Admin':
                return 'bg-red-50 text-red-500 border-red-100 dark:bg-red-950/20 dark:border-red-900/30';
            case 'Admin':
                return 'bg-orange-50 text-orange-500 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30';
            case 'Sales Staff':
                return 'bg-green-50 text-green-500 border-green-100 dark:bg-green-950/20 dark:border-green-900/30';
            case 'Support Staff':
            case 'Supporter':
                return 'bg-blue-50 text-blue-500 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30';
            default:
                return 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900/20 dark:border-gray-800/30';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-headings">Employees</h2>
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-bgBlue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-customShadow flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Create Platform Employees
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Employee Name</th>
                                <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                                <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Last Login</th>
                                <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingEmployees ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-muted">Loading employees...</td>
                                </tr>
                            ) : (employeesData?.data || []).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-muted">No employees found.</td>
                                </tr>
                            ) : (employeesData?.data || []).map((emp: any, i: number) => (
                                <tr key={emp.id} className="border-b border-border/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <ProfileAvatar 
                                                imageUrl={emp.user?.image_url || emp.user?.profileImage} 
                                                name={emp.user?.username || emp.user?.full_name || ''} 
                                                size="sm" 
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-headings">{emp.user?.username || emp.user?.full_name || 'N/A'}</p>
                                                    {emp.isDeleted && (
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                                            Deleted
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted">{emp.user?.account?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold border ${getRoleBadgeStyle(emp.user?.role || 'N/A')}`}>
                                            {emp.user?.role || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-body">
                                        <div className="flex items-center gap-2 text-muted">
                                            <Clock className="w-4 h-4" />
                                            {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleOpenViewModal(emp)}
                                                className="text-muted hover:text-bgBlue transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenEditModal(emp)}
                                                className="text-muted hover:text-bgBlue transition-colors cursor-pointer"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button className="text-muted hover:text-red-500 transition-colors cursor-pointer">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Employee Dialog */}
            <BaseDialog
                open={addEmployeeOpen}
                setOpen={setAddEmployeeOpen}
                title={viewOnly ? "View Platform Employee" : isEditing ? "Edit Platform Employee" : "Add Platform Employee"}
                description={viewOnly ? "View employee details." : isEditing ? "Edit employee details and permissions." : "Add a new employee to your team."}
                maxWidth="md"
                hideScrollbar={true}
            >
                {viewOnly ? (
                    <div className="space-y-6 pt-2 pb-10">
                        {/* Header Section */}
                        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-border/50">
                            <ProfileAvatar 
                                imageUrl={currentUser?.user?.image_url || currentUser?.user?.profileImage} 
                                name={formData.name} 
                                size="lg" 
                            />
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-headings tracking-tight">{formData.name}</h3>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted">
                                    <Mail className="w-3.5 h-3.5" />
                                    {formData.email}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl border border-border/50 space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-muted/80">Platform Role</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-bgBlue/10 flex items-center justify-center text-bgBlue">
                                        <Shield className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-sm font-bold text-headings">{formData.role}</p>
                                </div>
                            </div>

                            {formData.role === 'Supporter' && (
                                <div className="bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl border border-border/50 space-y-1">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted/80">Specialization</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-sm font-bold text-headings">
                                            {formData.supporterRole.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl border border-border/50 space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-muted/80">User Status</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-sm font-bold text-headings">Active Now</p>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl border border-border/50 space-y-1">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-muted/80">Joined On</p>
                                <div className="flex items-center gap-2 text-headings">
                                    <Clock className="w-3.5 h-3.5 text-muted" />
                                    <p className="text-sm font-bold">
                                        {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Skills Section */}
                        {formData.role === 'Supporter' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted/80">Core Expertise</p>
                                    <span className="text-[10px] font-bold text-bgBlue px-2 py-0.5 bg-bgBlue/10 rounded-md">
                                        {formData.skills.length} Skills
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills.map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-navbarBg border border-border rounded-lg text-xs font-bold text-headings shadow-sm hover:border-bgBlue/30 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={() => setAddEmployeeOpen(false)}
                                className="w-full bg-bgBlue hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg cursor-pointer"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 pt-4 pb-10">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-bold text-headings">Username <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.name ? 'text-red-400' : 'text-muted'}`} />
                                <Input
                                    placeholder="Jon Smith"
                                    value={formData.name}
                                    required
                                    disabled={viewOnly}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`bg-navbarBg h-11 pl-10 text-headings focus:ring-2 placeholder:text-gray-400 transition-all ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-bgBlue/30 focus:border-bgBlue'} ${viewOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-bold text-headings">Email <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.email ? 'text-red-400' : 'text-muted'}`} />
                                <Input
                                    placeholder="lawal@tape.com"
                                    value={formData.email}
                                    type="email"
                                    required
                                    disabled={viewOnly || isEditing}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`bg-navbarBg h-11 pl-10 text-headings focus:ring-2 placeholder:text-gray-400 transition-all ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-bgBlue/30 focus:border-bgBlue'} ${(viewOnly || isEditing) ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50' : ''}`}
                                />
                            </div>
                            {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-bold text-headings">Password <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Shield className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${errors.password ? 'text-red-400' : 'text-muted'}`} />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="H2di%hGa3d"
                                    value={formData.password}
                                    disabled={viewOnly}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`bg-navbarBg h-11 pl-10 pr-10 text-headings focus:ring-2 placeholder:text-gray-400 transition-all ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-bgBlue/30 focus:border-bgBlue'} ${viewOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-bgBlue transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-bold text-headings">Role <span className="text-red-500">*</span></Label>
                            <CustomSelect
                                options={[
                                    { label: 'Admin', value: 'Admin' },
                                    { label: 'Supporter', value: 'Supporter' },
                                ]}
                                placeholder="Select Role"
                                value={formData.role}
                                disabled={viewOnly}
                                className={errors.role ? 'border-red-500' : ''}
                                onChange={(val: any) => handleInputChange('role', val)}
                            />
                            {errors.role && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.role}</p>}
                        </div>

                        {formData.role === 'Supporter' && (
                            <>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-headings">Supporter Role <span className="text-red-500">*</span></Label>
                                    <CustomSelect
                                        options={[
                                            { label: 'Device Support', value: 'DEVICE_SUPPORT' },
                                            { label: 'Payment Support', value: 'PAYMENT_SUPPORT' },
                                            { label: 'Tech Support', value: 'TECH_SUPPORT' },
                                            { label: 'Account Support', value: 'ACCOUNT_SUPPORT' },
                                            { label: 'Order Support', value: 'ORDER_SUPPORT' },
                                            { label: 'General Support', value: 'GENERAL_SUPPORT' },
                                        ]}
                                        placeholder="Supporter Role"
                                        value={formData.supporterRole}
                                        disabled={viewOnly}
                                        className={errors.supporterRole ? 'border-red-500' : ''}
                                        onChange={(val: any) => handleInputChange('supporterRole', val)}
                                    />
                                    {errors.supporterRole && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.supporterRole}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-headings">Skills <span className="text-red-500">*</span></Label>
                                    <CustomSelect
                                        options={[
                                            { label: 'Technical Support', value: 'Technical Support' },
                                            { label: 'Customer Service', value: 'Customer Service' },
                                            { label: 'Network Admin', value: 'Network Admin' },
                                            { label: 'Cloud Computing', value: 'Cloud Computing' },
                                        ]}
                                        placeholder="Select Skills"
                                        value={formData.skills}
                                        multiple={true}
                                        disabled={viewOnly}
                                        className={errors.skills ? 'border-red-500' : ''}
                                        onChange={(val: any) => handleInputChange('skills', val)}
                                    />
                                    {errors.skills && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.skills}</p>}
                                </div>
                            </>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setAddEmployeeOpen(false)}
                                className="flex-1 px-4 py-2.5 border border-border rounded-xl font-bold text-headings hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isCreating || isUpdating}
                                className={`flex-1 bg-bgBlue hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-customShadow cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isUpdating ? "Updating..." : isCreating ? "Creating..." : isEditing ? "Update Employee" : "Add Employee"}
                            </button>
                        </div>
                    </div>
                )}
            </BaseDialog>
        </div>
    );
}






