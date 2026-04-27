'use client';

import React, { useState } from 'react';
import { Search, Plus, Eye, MoreVertical, X, Settings, ChevronRight, Home, HomeIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockTickets, type SupportTicket, type TicketStatus, type TicketPriority, type TicketType } from '@/types/supportTickets';
import TicketChatPanel from '@/components/Admin/support/TicketChatPanel';
import CreateTicketModal from '@/components/Admin/modals/CreateTicketModal';
import TicketDetailsModal from '@/components/Admin/modals/TicketDetailsModal';
import EditTicketModal from '@/components/Admin/modals/EditTicketModal';
import DeleteConfirmationModal from '@/components/Admin/modals/DeleteConfirmationModal';
import SetAssignRulesModal from '@/components/Admin/modals/SetAssignRulesModal';
import Link from 'next/link';

export default function SupportTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<TicketType | 'all'>('all');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter tickets based on search and filters
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = searchQuery === '' ||
            ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
        const matchesType = typeFilter === 'all' || ticket.type === typeFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    const handleRowClick = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsChatOpen(true);
    };

    const handleViewDetails = (ticket: SupportTicket, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTicket(ticket);
        setIsDetailsModalOpen(true);
    };

    const handleEdit = (ticket: SupportTicket, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTicket(ticket);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (ticket: SupportTicket, e: React.MouseEvent) => {
        e.stopPropagation();
        setTicketToDelete(ticket);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (ticketToDelete) {
            setTickets(tickets.filter(t => t.id !== ticketToDelete.id));
            setTicketToDelete(null);
        }
    };

    const handleStatusChange = (ticket: SupportTicket, newStatus: TicketStatus, e: React.MouseEvent) => {
        e.stopPropagation();
        setTickets(tickets.map(t =>
            t.id === ticket.id
                ? { ...t, status: newStatus }
                : t
        ));
    };

    const handleCreateTicket = (data: any) => {
        const newTicket: SupportTicket = {
            id: String(tickets.length + 1),
            ticketId: `TICK-${String(tickets.length + 1).padStart(3, '0')}`,
            user: data.customer,
            type: data.type,
            priority: data.priority,
            status: 'Open',
            subject: data.subject,
            description: data.note,
            created: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }),
            assignedTo: data.assign,
        };
        setTickets([newTicket, ...tickets]);
    };

    const handleUpdateTicket = (data: any) => {
        if (selectedTicket) {
            setTickets(tickets.map(t =>
                t.id === selectedTicket.id
                    ? { ...t, ...data }
                    : t
            ));
        }
    };

    const getPriorityVariant = (priority: TicketPriority): "default" | "warning" | "error" => {
        switch (priority) {
            case 'Low': return 'default';
            case 'Medium': return 'warning';
            case 'High': return 'error';
        }
    };

    const getStatusVariant = (status: TicketStatus): "default" | "info" | "success" => {
        switch (status) {
            case 'Open': return 'default';
            case 'In Progress': return 'info';
            case 'Completed': return 'success';
        }
    };

    const getPlanVariant = (planType: string): "guest" | "trial" | "pro" | "enterprise" => {
        switch (planType) {
            case 'Guest': return 'guest';
            case 'Trial': return 'trial';
            case 'Pro': return 'pro';
            case 'Enterprise': return 'enterprise';
            default: return 'guest';
        }
    };

    return (
        <div className="min-h-screen">

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
                <Link href="/admin/dashboard">
                    <HomeIcon className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Customer Supports</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-bgBlue font-medium">Support Tickets</span>
            </div>
            {/* Header */}
            <div className="border-b border-border pb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Customer Support</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage customer support tickets and resolve issues</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/reports/customer-service-&-support-reports" className="text-nowrap px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-navbarBg border border-border shadow-customShadow rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden lg:block">View Reports</span>
                        </Link>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-nowrap px-3 py-2 text-xs font-medium text-white bg-bgBlue rounded-md shadow-customShadow hover:bg-blue-500 dark:hover:bg-blue-500 flex items-center gap-1.5 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden lg:block">Create Ticket</span>
                        </button>
                        <button
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="text-nowrap px-3 py-2 text-xs font-medium text-white bg-bgBlue rounded-md shadow-customShadow hover:bg-blue-500 dark:hover:bg-blue-500 flex items-center gap-1.5 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="mt-6 mb-4">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search devices by name, location, screen, ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm bg-navbarBg border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | 'all')}>
                            <SelectTrigger className="w-[140px] text-xs">
                                <SelectValue placeholder="In Progress (1)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TicketPriority | 'all')}>
                            <SelectTrigger className="w-[120px] text-xs">
                                <SelectValue placeholder="Guest (1)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TicketType | 'all')}>
                            <SelectTrigger className="w-[120px] text-xs">
                                <SelectValue placeholder="Sales (1)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Device">Device</SelectItem>
                                <SelectItem value="Account">Account</SelectItem>
                                <SelectItem value="Payment">Payment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                    {filteredTickets.length} Tickets
                </div>
            </div>

            {/* Table */}
            <div className="bg-navbarBg rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Ticket ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Ticket Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Priority</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Assign</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedTickets.map((ticket) => (
                                <tr
                                    key={ticket.id}
                                    onClick={() => handleRowClick(ticket)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {ticket.hasRedDot && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            )}
                                            <span className="text-xs font-medium text-gray-900 dark:text-white">{ticket.ticketId}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {ticket.user.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-900 dark:text-white">{ticket.user.name}</span>
                                                    <Badge variant={getPlanVariant(ticket.user.planType)} className="text-[10px] px-1.5 py-0">
                                                        {ticket.user.planType}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{ticket.user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-gray-900 dark:text-white">{ticket.type}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getPriorityVariant(ticket.priority)} className="text-xs">
                                            {ticket.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={getStatusVariant(ticket.status)} className="text-xs">
                                            {ticket.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">{ticket.created}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {ticket.assignedTo ? (
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                                                        {ticket.assignedTo.charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-900 dark:text-white">{ticket.assignedTo}</span>
                                            </div>
                                        ) : (
                                            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                                + Assign
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleViewDetails(ticket, e)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                                                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={(e) => handleEdit(ticket, e as any)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => handleDeleteClick(ticket, e as any)}
                                                        className="text-red-600 dark:text-red-400"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                    <div className="border-t border-border my-1"></div>
                                                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                        Change Status
                                                    </div>
                                                    <DropdownMenuItem
                                                        onClick={(e) => handleStatusChange(ticket, 'Open', e as any)}
                                                        disabled={ticket.status === 'Open'}
                                                    >
                                                        Open
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => handleStatusChange(ticket, 'In Progress', e as any)}
                                                        disabled={ticket.status === 'In Progress'}
                                                    >
                                                        In Progress
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => handleStatusChange(ticket, 'Completed', e as any)}
                                                        disabled={ticket.status === 'Completed'}
                                                    >
                                                        Completed
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length} tickets
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${currentPage === page
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-border hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Panel */}
            <TicketChatPanel
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                ticket={selectedTicket}
            />

            {/* Modals */}
            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateTicket}
            />

            <TicketDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                ticket={selectedTicket}
            />

            <EditTicketModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                ticket={selectedTicket}
                onSave={handleUpdateTicket}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Ticket"
                description="Are you sure you want to delete this support ticket? This action cannot be undone."
                itemName={ticketToDelete?.ticketId}
            />

            <SetAssignRulesModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSave={(rules) => {
                    console.log('Assign rules saved:', rules);
                    setIsSettingsModalOpen(false);
                }}
            />
        </div>
    );
}



// export default function(){
//     return(
//         <>
//             <div className="text-black dark:text-white text-2xl font-semibold">Support tickets page</div>
//         </>
//     )
// }