"use client";

import { useState } from "react";
import { invoices } from "../_data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import BaseSelect from "@/common/BaseSelect";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, RotateCcw, FileText, Search, CloudDownload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RefundDialog from "./RefundDialog";
import TransactionSheet from "./TransactionSheet";

const BillingTab = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("month");
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<string>("");

    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch = inv.subscriberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.subscriberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleRefundClick = (id: string) => {
        setSelectedInvoice(id);
        setRefundDialogOpen(true);
    };

    const handleViewDetails = (id: string) => {
        setSelectedInvoice(id);
        setSheetOpen(true);
    };

    return (
        <div className="">
            {/* Table */}
            <div className="rounded-xl border border-border bg-navbarBg overflow-hidden">
                <div className="flex items-center justify-between p-4 md:p-6 p-4 md:p-6">
                    <h2 className="text-headings text-lg font-semibold">Payment history</h2>
                    <button className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out">Download All</button>
                </div>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 md:p-6 border-t border-border">
                    {/* Search Input */}
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            placeholder="Search by name, email, or user ID..."
                            className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 placeholder:text-muted focus-visible:ring-0 focus:outline-none text-body"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="w-[160px]">
                            <BaseSelect
                                placeholder="All Status"
                                options={[
                                    { label: "All Status", value: "all" },
                                    { label: "Paid", value: "Paid" },
                                    { label: "Failed", value: "Failed" },
                                    { label: "Refunded", value: "Refunded" },
                                ]}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                showLabel={false}
                            />
                        </div>
                        <div className="w-[160px]">
                            <BaseSelect
                                placeholder="This Month"
                                options={[
                                    { label: "This Month", value: "month" },
                                    { label: "Last Month", value: "last_month" },
                                    { label: "Yearly", value: "year" },
                                ]}
                                value={dateFilter}
                                onChange={setDateFilter}
                                showLabel={false}
                            />
                        </div>
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-cardBackground text-muted">
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.map((inv) => (
                            <TableRow key={inv.id}>
                                <TableCell className="font-semibold text-headings">{inv.id}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium text-headings">{inv.subscriberName}</div>
                                        <div className="text-sm text-muted">{inv.subscriberEmail}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1 py-0.5 rounded border border-blue-200">VISA</span>
                                        <span className="text-headings">**** **** **** {inv.last4}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold text-headings">{inv.amount}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="default"
                                        className={`
                            font-normal border
                            ${inv.status === 'Paid' ? 'text-green-600 bg-green-50 border-green-200' : ''}
                            ${inv.status === 'Failed' ? 'text-red-600 bg-red-50 border-red-200' : ''}
                            ${inv.status === 'Refunded' ? 'text-purple-600 bg-purple-50 border-purple-200' : ''}
                        `}
                                    >
                                        {inv.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted">{inv.date}</TableCell>
                                <TableCell>
                                    <Button size="icon" className="text-muted hover:bg-gray-100">
                                        <CloudDownload className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" className="h-8 w-8 text-muted hover:bg-gray-100">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleViewDetails(inv.id)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            {inv.status === 'Paid' && (
                                                <>
                                                    <DropdownMenuItem>
                                                        <FileText className="mr-2 h-4 w-4" /> Resend Receipt
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRefundClick(inv.id)}>
                                                        <RotateCcw className="mr-2 h-4 w-4" /> Issue Refund
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            {inv.status === 'Failed' && (
                                                <DropdownMenuItem>
                                                    <RotateCcw className="mr-2 h-4 w-4" /> Retry Charge
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Pagination */}
                <div className="flex items-center justify-between p-4 md:p-6 border-t">
                    <div className="text-sm text-muted">Showing {filteredInvoices.length} of {invoices.length} invoices</div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out" disabled>Previous</button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-borderGray dark:border-gray-600 rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out">Next</button>
                    </div>
                </div>
            </div>

            <RefundDialog
                open={refundDialogOpen}
                setOpen={setRefundDialogOpen}
                invoiceId={selectedInvoice}
            />

            {/* <TransactionSheet
                open={sheetOpen}
                setOpen={setSheetOpen}
                transactionId={selectedInvoice}
            /> */}
        </div>
    );
};

export default BillingTab;
