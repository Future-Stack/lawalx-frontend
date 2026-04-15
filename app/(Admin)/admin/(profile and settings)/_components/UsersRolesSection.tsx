'use client';

import { useState } from 'react';
import { Plus, Search, Calendar, MoreVertical, Shield, MoreHorizontal, Check, Users, ListTodo, Settings2 } from 'lucide-react';
import Tabs from '@/common/Tabs';
import BaseSelect from '@/common/BaseSelect';
import BaseDialog from '@/common/BaseDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UsersRolesTab = 'Employees' | 'Activity Logs' | 'Roles';

export default function UsersRolesSection() {
    const [activeTab, setActiveTab] = useState<UsersRolesTab>('Employees');
    const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
    const [createRoleOpen, setCreateRoleOpen] = useState(false);

    const tabs = [
        { label: 'Employees' as UsersRolesTab, icon: Users },
        { label: 'Activity Logs' as UsersRolesTab, icon: ListTodo },
        { label: 'Roles' as UsersRolesTab, icon: Settings2 },
    ];

    const employees = [
        { name: 'You', email: 'john@gmail.com', role: 'Super Admin', lastLogin: '1 hour ago', security: '2-FA' },
        { name: 'John Smith', email: 'john@gmail.com', role: 'Admin', lastLogin: '1 hour ago', security: '2-FA' },
        { name: 'John Smith', email: 'john@gmail.com', role: 'Sales Staff', lastLogin: '1 hour ago', security: '2-FA', notes: 'Multiple Devices' },
        { name: 'John Smith', email: 'john@gmail.com', role: 'Support Staff', lastLogin: '1 hour ago', security: '2-FA' },
    ];

    const activities = [
        { activity: 'Permanently deleted inactive user account', name: 'You', role: 'Super Admin', email: 'john@gmail.com', device: '192.168.1.107.1', os: 'Macbook Air 2025', location: 'Chicago, IL', date: 'December 2, 2024 11:30 AM' },
        { activity: 'Content Uploaded', name: 'John Smith', role: 'Admin', email: 'john@gmail.com', device: '192.168.1.107.1', os: 'Macbook Air 2025', location: 'Chicago, IL', date: 'December 2, 2024 11:30 AM' },
        { activity: 'New Devices added', name: 'John Smith', role: 'Admin', email: 'john@gmail.com', device: '192.168.1.107.1', os: 'Macbook Air 2025', location: 'Chicago, IL', date: 'December 2, 2024 11:30 AM' },
    ];

    const roles = [
        { name: 'Admin', permissions: 'User, Media, Subscription, Fleet, Support, Fleet, Map' },
        { name: 'Admin', permissions: 'User, Media, Subscription, Fleet, Support, Fleet, Map' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {activeTab === 'Employees' && (
                <div className="bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-headings">Employees</h2>
                        <button
                            onClick={() => setAddEmployeeOpen(true)}
                            className="bg-bgBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-customShadow flex items-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add Employee
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Employee Name</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Role</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Last Login</th>
                                    {/* <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Security</th> */}
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    <img src="/images/profile-settings.png" alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-headings">{emp.name}</p>
                                                    <p className="text-xs text-muted">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${emp.role === 'Super Admin' ? 'bg-red-50 text-red-500 border-red-100' :
                                                    emp.role === 'Admin' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                                                        emp.role === 'Sales Staff' ? 'bg-green-50 text-green-500 border-green-100' :
                                                            'bg-blue-50 text-blue-500 border-blue-100'
                                                }`}>
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-body">
                                            {emp.lastLogin}
                                        </td>
                                        {/* <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-500 border border-green-100">
                                                    <Check className="w-2.5 h-2.5" /> {emp.security}
                                                </span>
                                                {emp.notes && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100">
                                                        {emp.notes}
                                                    </span>
                                                )}
                                            </div>
                                        </td> */}
                                        <td className="py-4 px-4 text-right">
                                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-muted">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'Activity Logs' && (
                <div className="bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-semibold text-headings">Activity Logs</h2>
                        <div className="flex items-center gap-3">
                            <BaseSelect
                                options={[{ label: 'Employee Name', value: 'all' }]}
                                value="all"
                                showLabel={false}
                                className="w-48"
                            />
                            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-input">
                                <Calendar className="w-4 h-4 text-muted" />
                                <span className="text-xs font-medium text-muted">Select Range</span>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Activity</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Employee Name</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Device & IP Address</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Location</th>
                                    <th className="py-4 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Time & Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((act, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                        <td className="py-4 px-4 text-sm font-medium text-headings w-64">
                                            {act.activity}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    <img src="/images/profile-settings.png" alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-headings flex items-center gap-2">
                                                        {act.name}
                                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${act.role === 'Super Admin' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-orange-50 text-orange-500 border-orange-100'
                                                            }`}>
                                                            {act.role}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-muted">{act.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-headings">{act.device}</p>
                                                <p className="text-xs text-muted">{act.os}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-body">
                                            {act.location}
                                        </td>
                                        <td className="py-4 px-4 text-xs text-muted w-48 leading-relaxed">
                                            {act.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'Roles' && (
                <div className="space-y-6">
                    <div className="bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-headings mb-1">Role Templates</h2>
                        <p className="text-sm text-muted mb-6">Pre-assigned permission sets for different admin roles.</p>
                        <div className="space-y-4">
                            {roles.map((role, i) => (
                                <div key={i} className="p-5 border border-border rounded-xl relative group">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-md font-bold text-headings">{role.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-muted"><Search className="w-4 h-4" /></button>
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-muted"><Shield className="w-4 h-4" /></button>
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-muted"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Permissions</p>
                                        <p className="text-sm text-body leading-relaxed">{role.permissions}</p>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted hover:bg-gray-100 transition-colors border border-border cursor-pointer">
                                            <Shield className="w-3.5 h-3.5" /> Admis
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted hover:bg-gray-100 transition-colors border border-border cursor-pointer">
                                            <Shield className="w-3.5 h-3.5" /> Admis
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted hover:bg-gray-100 transition-colors border border-border cursor-pointer">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <button className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <MoreHorizontal className="w-4 h-4 text-muted" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6">
                            <button
                                onClick={() => setCreateRoleOpen(true)}
                                className="w-full h-12 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-muted hover:text-bgBlue hover:border-bgBlue transition-all cursor-pointer font-medium"
                            >
                                <Plus className="w-5 h-5" /> Create Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <BaseDialog
                open={addEmployeeOpen}
                setOpen={setAddEmployeeOpen}
                title="Add Employee"
                description="Add a new employee to your team."
                maxWidth="md"
            >
                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input placeholder="email@example.com" className="bg-input border-border h-11" />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <BaseSelect
                            options={[
                                { label: 'Admin', value: 'admin' },
                                { label: 'Sales Staff', value: 'sales' },
                                { label: 'Support Staff', value: 'support' },
                            ]}
                            showLabel={false}
                            className="h-11"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={() => setAddEmployeeOpen(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium cursor-pointer">Cancel</button>
                        <button onClick={() => setAddEmployeeOpen(false)} className="flex-1 bg-bgBlue text-white px-4 py-2.5 rounded-lg font-medium cursor-pointer">Add Employee</button>
                    </div>
                </div>
            </BaseDialog>

            <BaseDialog
                open={createRoleOpen}
                setOpen={setCreateRoleOpen}
                title="Create A Role"
                description="Define a new role and its permissions."
                maxWidth="xl"
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2 text-center pb-4 border-b border-border">
                        <h3 className="text-lg font-bold text-headings">Permission Matrix</h3>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between p-4 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-border" />
                                <span className="text-sm font-medium text-headings">User Management</span>
                            </div>
                            <BaseSelect options={[{ label: 'Select Access', value: 'select' }]} showLabel={false} className="w-48" />
                        </div>
                        <div className="flex items-center justify-between p-4 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full border-2 border-border" />
                                <span className="text-sm font-medium text-headings">Fleet Management</span>
                            </div>
                            <BaseSelect options={[{ label: 'Select Access', value: 'select' }]} showLabel={false} className="w-48" />
                        </div>
                    </div>
                    <div className="bg-red-50/30 p-4 rounded-lg border border-red-100 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-red-300 bg-red-50" />
                            <span className="text-sm font-bold text-red-500 uppercase tracking-wider">Danger Zone</span>
                        </div>
                        <p className="text-xs text-red-400 mt-2 ml-7">Employee Management Access provides ultimate control over sensitive data.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setCreateRoleOpen(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium cursor-pointer">Cancel</button>
                        <button onClick={() => setCreateRoleOpen(false)} className="flex-1 bg-bgBlue text-white px-4 py-2.5 rounded-lg font-medium cursor-pointer">Create Role</button>
                    </div>
                </div>
            </BaseDialog>
        </div>
    );
}
