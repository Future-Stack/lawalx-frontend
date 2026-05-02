'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateEmployeeMutation, SupporterRole } from '@/redux/api/admin/support/adminSupporterApi';
import type { EmployeeData } from '@/redux/api/admin/support/adminSupporterApi';
import { cn } from '@/lib/utils';

interface EditEmployeeDialogProps {
  employee: EmployeeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: EditEmployeeDialogProps) {
  const [updateEmployee, { isLoading }] = useUpdateEmployeeMutation();
  const [formData, setFormData] = useState({
    username: '',
    supporterRole: [] as string[],
    skills: [] as string[],
  });

  const [activeDropdown, setActiveDropdown] = useState<'role' | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const dropdownRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (employee && open) {
      setFormData({
        username: employee.user.username || '',
        supporterRole: employee.supporterRole || [],
        skills: employee.skills || [],
      });
    }
  }, [employee, open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      await updateEmployee({
        id: employee.id,
        body: formData,
      }).unwrap();
      toast.success('Employee updated successfully');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update employee');
    }
  };

  const toggleRole = (role: string) => {
    setFormData(prev => {
      const isSelected = prev.supporterRole.includes(role);
      const nextRoles = isSelected 
        ? prev.supporterRole.filter(r => r !== role)
        : [...prev.supporterRole, role];
      return { ...prev, supporterRole: nextRoles };
    });
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      setSkillInput('');
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const roles = Object.values(SupporterRole);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[600px] p-0 bg-white dark:bg-gray-900 border-none shadow-2xl overflow-visible [&>button]:hidden"
      >
        <DialogHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Supports Employee List
          </DialogTitle>
          <button 
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6" ref={dropdownRef}>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Role Field - Multi Select Custom Dropdown */}
          <div className="space-y-2 relative">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </Label>
            <div
              onClick={() => setActiveDropdown(activeDropdown === 'role' ? null : 'role')}
              className="w-full min-h-[48px] px-3 py-2 flex flex-wrap gap-2 items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer transition-all"
            >
              <div className="flex flex-wrap gap-1.5">
                {formData.supporterRole.length > 0 ? (
                  formData.supporterRole.map(role => (
                    <span key={role} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-800">
                      {role.replace(/_/g, ' ')}
                      <X className="w-3 h-3 hover:text-blue-800 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleRole(role); }} />
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 ml-1">Select roles</span>
                )}
              </div>
              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform flex-shrink-0", activeDropdown === 'role' && "rotate-180")} />
            </div>
            
            {activeDropdown === 'role' && (
              <div className="absolute top-[calc(100%+4px)] left-0 w-full z-[100] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto py-2 animate-in fade-in zoom-in-95 duration-150">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                  >
                    <span className={cn(formData.supporterRole.includes(role) ? "text-blue-600 font-medium" : "text-gray-700 dark:text-gray-300")}>
                      {role.replace(/_/g, ' ')}
                    </span>
                    {formData.supporterRole.includes(role) && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Skills
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-blue-500"
              />
              <Button 
                type="button" 
                onClick={addSkill}
                className="h-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl px-4"
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              {formData.skills.length > 0 ? (
                formData.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium border border-green-100 dark:border-green-800 animate-in fade-in zoom-in duration-200">
                    {skill}
                    <button 
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="hover:text-green-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">No skills added yet</span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 px-8 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 px-10 bg-[#00A3FF] hover:bg-[#008EDB] text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20"
            >
              {isLoading ? 'Updating...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
