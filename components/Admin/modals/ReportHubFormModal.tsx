'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    ArrowRight,
    Trash2,
    Plus,
    Clock,
    X,
    GripVertical
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// DND Kit
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Types & Data ---

import { DATA_SOURCES, OPERATORS_BY_TYPE, ReportColumn, FieldType } from '@/constants/reportHubConstants';

// --- Components ---

function SortableItem({ id, label, onRemove }: { id: string; label: string; onRemove: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-border rounded-xl group"
        >
            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                    <GripVertical className="w-4 h-4" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <X className="w-4 h-4 text-gray-300 cursor-pointer hover:text-red-500" onClick={onRemove} />
        </div>
    );
}

interface ReportHubFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    initialData?: any;
    onSave?: (report: any) => void;
}

export default function ReportHubFormModal({
    isOpen,
    onClose,
    mode,
    initialData,
    onSave
}: ReportHubFormModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dataSource: 'Device Data',
        selectedColumnIds: [] as string[],
        filters: [] as { fieldId: string; operator: string; value: string }[],
        enableSchedule: false,
        frequency: 'Weekly',
        dayOfWeek: 'Monday',
        dayOfMonth: '1',
        time: '09:00',
        emailRecipients: '',
        emailSubject: '',
        emailMessage: '',
        outputFormat: 'Excel'
    });

    // Reset steps and form on open
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    ...formData,
                    ...initialData,
                    selectedColumnIds: initialData.selectedColumnIds || []
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    dataSource: 'Device Data',
                    selectedColumnIds: [],
                    filters: [],
                    enableSchedule: false,
                    frequency: 'Weekly',
                    dayOfWeek: 'Monday',
                    dayOfMonth: '1',
                    time: '09:00',
                    emailRecipients: '',
                    emailSubject: '',
                    emailMessage: '',
                    outputFormat: 'Excel'
                });
            }
            setStep(1);
        }
    }, [isOpen, mode, initialData]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const availableColumns = useMemo(() => DATA_SOURCES[formData.dataSource] || [], [formData.dataSource]);

    const selectedColumns = useMemo(() => {
        return formData.selectedColumnIds
            .map(id => availableColumns.find(col => col.id === id))
            .filter(Boolean) as ReportColumn[];
    }, [formData.selectedColumnIds, availableColumns]);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFormData(prev => {
                const oldIndex = prev.selectedColumnIds.indexOf(active.id);
                const newIndex = prev.selectedColumnIds.indexOf(over.id);
                return {
                    ...prev,
                    selectedColumnIds: arrayMove(prev.selectedColumnIds, oldIndex, newIndex),
                };
            });
        }
    };

    const toggleColumn = (colId: string) => {
        setFormData(prev => {
            const exists = prev.selectedColumnIds.includes(colId);
            if (exists) {
                return { ...prev, selectedColumnIds: prev.selectedColumnIds.filter(id => id !== colId) };
            } else {
                return { ...prev, selectedColumnIds: [...prev.selectedColumnIds, colId] };
            }
        });
    };

    const addFilter = () => {
        if (selectedColumns.length > 0) {
            setFormData(prev => ({
                ...prev,
                filters: [...prev.filters, { fieldId: selectedColumns[0].id, operator: OPERATORS_BY_TYPE[selectedColumns[0].type][0].value, value: '' }]
            }));
        }
    };

    const updateFilter = (index: number, updates: any) => {
        setFormData(prev => {
            const news = [...prev.filters];
            news[index] = { ...news[index], ...updates };
            return { ...prev, filters: news };
        });
    };

    const removeFilter = (index: number) => {
        setFormData(prev => ({
            ...prev,
            filters: prev.filters.filter((_, i) => i !== index)
        }));
    };

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else {
            onSave?.(formData);
            onClose();
        }
    };

    const steps = [
        { id: 1, title: 'Report Details' },
        { id: 2, title: 'Configure Columns & Filters' },
        { id: 3, title: 'Schedule & Delivery' },
        { id: 4, title: 'Review & Save' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-0 bg-white dark:bg-gray-900 border-none rounded-xl overflow-hidden focus:outline-none">
                <div className="p-8">
                    <DialogHeader className="flex flex-row items-start justify-between space-y-0 pb-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center border border-purple-100 dark:border-purple-800">
                                <FileText className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                    {mode === 'add' ? 'Create New Report' : 'Edit Report'}
                                </DialogTitle>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Step {step} of 4: {steps[step - 1].title}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mb-10 px-2">
                        {steps.map((s, i) => (
                            <React.Fragment key={s.id}>
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all shadow-customShadow",
                                        step === s.id ? "bg-blue-500 text-white" :
                                            step > s.id ? "bg-blue-400 text-white" :
                                                "bg-gray-50 dark:bg-gray-800 text-gray-400"
                                    )}
                                >
                                    {s.id}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="flex-1 h-[1px] bg-border" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="min-h-[420px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6 text-gray-500 dark:text-gray-400"
                                >
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Report Name *</Label>
                                        <Input
                                            placeholder="Report Name"
                                            className="h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Description (Optional)</Label>
                                        <textarea
                                            placeholder="Describe the purpose of this report"
                                            className="w-full min-h-[120px] p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">Data Source</Label>
                                        <Select value={formData.dataSource} onValueChange={v => setFormData({ ...formData, dataSource: v, selectedColumnIds: [] })}>
                                            <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl w-full text-gray-500 dark:text-gray-400">
                                                <SelectValue placeholder="Select data source" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl w-full bg-navbarBg">
                                                {Object.keys(DATA_SOURCES).map(ds => (
                                                    <SelectItem key={ds} value={ds} className='w-full bg-navbarBg text-black dark:text-gray-400'>{ds}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-4">
                                        <Label className="text-sm font-semibold">Select Columns *</Label>
                                        <p className="text-xs text-gray-400">Choose and order the data columns</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-hide">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Available</p>
                                                {availableColumns.map(col => {
                                                    const isSelected = formData.selectedColumnIds.includes(col.id);
                                                    return (
                                                        <div
                                                            key={col.id}
                                                            onClick={() => !isSelected && toggleColumn(col.id)}
                                                            className={cn(
                                                                "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border rounded-xl group transition-all",
                                                                isSelected ? "opacity-40 cursor-default border-gray-100" : "cursor-pointer border-gray-100 dark:border-gray-800 hover:border-blue-200"
                                                            )}
                                                        >
                                                            <span className="text-xs font-medium">{col.label}</span>
                                                            {!isSelected && <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="space-y-2 border-l border-gray-100 dark:border-gray-800 pl-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                                                    Selected ({formData.selectedColumnIds.length})
                                                </p>
                                                <DndContext
                                                    sensors={sensors}
                                                    collisionDetection={closestCenter}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <SortableContext
                                                        items={formData.selectedColumnIds}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <div className="space-y-2">
                                                            {selectedColumns.map(col => (
                                                                <SortableItem
                                                                    key={col.id}
                                                                    id={col.id}
                                                                    label={col.label}
                                                                    onRemove={() => toggleColumn(col.id)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-sm font-semibold">Filters (Optional)</Label>
                                                <p className="text-xs text-gray-400">Apply logic to your data</p>
                                            </div>
                                            <Button
                                                variant="outline" size="sm"
                                                disabled={selectedColumns.length === 0}
                                                className="h-9 bg-blue-50 dark:bg-blue-900/20 text-blue-500 border-none rounded-xl gap-2 px-4 shadow-none"
                                                onClick={addFilter}
                                            >
                                                <Plus className="w-4 h-4" /> Add Filter
                                            </Button>
                                        </div>
                                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                                            {formData.filters.map((filter, i) => {
                                                const currentField = availableColumns.find(c => c.id === filter.fieldId);
                                                const operators = currentField ? OPERATORS_BY_TYPE[currentField.type] : [];

                                                return (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <Select value={filter.fieldId} onValueChange={(v) => updateFilter(i, { fieldId: v, operator: OPERATORS_BY_TYPE[availableColumns.find(c => c.id === v)!.type][0].value, value: '' })}>
                                                            <SelectTrigger className="flex-1 h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl bg-navbarBg">
                                                                {selectedColumns.map(sc => (
                                                                    <SelectItem key={sc.id} value={sc.id}>{sc.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <Select value={filter.operator} onValueChange={(v) => updateFilter(i, { operator: v })}>
                                                            <SelectTrigger className="w-[130px] h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl">
                                                                {operators.map(op => (
                                                                    <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        {currentField?.type === 'option' ? (
                                                            <Select value={filter.value} onValueChange={(v) => updateFilter(i, { value: v })}>
                                                                <SelectTrigger className="flex-1 h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl text-xs">
                                                                    <SelectValue placeholder="Select..." />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl">
                                                                    {currentField.options?.map(opt => (
                                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : currentField?.type === 'date' && filter.operator === 'between' ? (
                                                            <div className="flex-1 flex gap-1">
                                                                <Input
                                                                    type="date"
                                                                    className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl text-xs px-2"
                                                                    onChange={(e) => updateFilter(i, { value: `${e.target.value}|${filter.value.split('|')[1] || ''}` })}
                                                                />
                                                                <Input
                                                                    type="date"
                                                                    className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl text-xs px-2"
                                                                    onChange={(e) => updateFilter(i, { value: `${filter.value.split('|')[0] || ''}|${e.target.value}` })}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <Input
                                                                type={currentField?.type === 'number' ? 'number' : currentField?.type === 'date' ? 'date' : currentField?.type === 'time' ? 'time' : 'text'}
                                                                placeholder="Value..."
                                                                className="flex-1 h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl text-xs"
                                                                value={filter.value}
                                                                onChange={(e) => updateFilter(i, { value: e.target.value })}
                                                            />
                                                        )}

                                                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => removeFilter(i)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="text-sm font-bold">Enable Schedule</p>
                                            <p className="text-xs text-gray-400">Automatically generate this report on a schedule</p>
                                        </div>
                                        <button
                                            onClick={() => setFormData({ ...formData, enableSchedule: !formData.enableSchedule })}
                                            className={cn(
                                                "w-11 h-6 rounded-full transition-colors relative",
                                                formData.enableSchedule ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                                                formData.enableSchedule ? "translate-x-5" : ""
                                            )} />
                                        </button>
                                    </div>

                                    {formData.enableSchedule && (
                                        <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold">Frequency</Label>
                                                <Select value={formData.frequency} onValueChange={v => setFormData({ ...formData, frequency: v })}>
                                                    <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="Daily">Daily</SelectItem>
                                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {formData.frequency !== 'Daily' && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-left-2">
                                                    <Label className="text-xs font-bold">{formData.frequency === 'Weekly' ? 'Day of Week' : 'Day of Month'}</Label>
                                                    <Select
                                                        value={formData.frequency === 'Weekly' ? formData.dayOfWeek : formData.dayOfMonth}
                                                        onValueChange={v => formData.frequency === 'Weekly' ? setFormData({ ...formData, dayOfWeek: v }) : setFormData({ ...formData, dayOfMonth: v })}
                                                    >
                                                        <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            {formData.frequency === 'Weekly' ? (
                                                                ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
                                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                                ))
                                                            ) : (
                                                                Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => (
                                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold">Time</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="time"
                                                        value={formData.time}
                                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                        className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl pr-10"
                                                    />
                                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-50 dark:border-gray-800 space-y-4">
                                        <div>
                                            <p className="text-sm font-bold">Delivery</p>
                                            <p className="text-xs text-gray-400">Recipient configuration</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold">Email Recipients</Label>
                                                <Input
                                                    placeholder="comma separated emails"
                                                    className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl"
                                                    value={formData.emailRecipients}
                                                    onChange={e => setFormData({ ...formData, emailRecipients: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold">Output Format</Label>
                                                <Select value={formData.outputFormat} onValueChange={v => setFormData({ ...formData, outputFormat: v })}>
                                                    <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="Excel">Excel</SelectItem>
                                                        <SelectItem value="PDF">PDF</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <Label className="text-xs font-bold">Email Subject</Label>
                                                <Input
                                                    placeholder="e.g. Weekly Device Report"
                                                    className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl"
                                                    value={formData.emailSubject}
                                                    onChange={e => setFormData({ ...formData, emailSubject: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <p className="text-sm font-bold">Review Your Configuration</p>

                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-gray-400">Report Name:</span>
                                                <span className="font-bold">{formData.name || 'Untitled Report'}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Data Source:</span>
                                                <span className="font-bold">{formData.dataSource}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Columns</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedColumns.map(col => (
                                                    <span key={col.id} className="px-2 py-1 bg-white dark:bg-gray-800 text-[10px] text-gray-600 rounded-full border border-gray-100">{col.label}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-gray-400">Schedule:</span>
                                                <span className="font-bold">{formData.enableSchedule ? `${formData.frequency} (${formData.frequency === 'Weekly' ? formData.dayOfWeek : 'Day ' + formData.dayOfMonth} @ ${formData.time})` : 'Disabled'}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Recipients:</span>
                                                <span className="font-bold truncate max-w-[200px]">{formData.emailRecipients || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-gray-50/30 dark:bg-gray-800/20 border-t border-gray-50 dark:border-gray-800 flex items-center gap-4">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-xl h-12 font-bold border-gray-200 dark:border-gray-700 shadow-none"
                        onClick={step === 1 ? onClose : () => setStep(step - 1)}
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button
                        className="flex-1 rounded-xl h-12 font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        onClick={handleNext}
                        disabled={step === 2 && formData.selectedColumnIds.length === 0}
                    >
                        {step === 4 ? (mode === 'add' ? 'Save Report' : 'Update Report') : 'Next'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
