"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { HomeIcon, ChevronRight, CloudDownload } from 'lucide-react';
import SupportStatsGrid from './_components/SupportStatsGrid';
import TicketsTable from './_components/TicketsTable';
import { useLazyGetAllSupportTicketsQuery } from '@/redux/api/admin/support/adminSupportTicketApi';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function SupportTickets2Page() {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [triggerExport] = useLazyGetAllSupportTicketsQuery();

  const handleExportPDF = async () => {
    try {
      const { data: exportData, isError } = await triggerExport({});

      if (isError || !exportData?.success) {
        toast.error("Failed to fetch export data");
        return;
      }

      const tickets = exportData.data || [];
      const doc = new jsPDF();

      // Add Title
      doc.setFontSize(18);
      doc.text('Support Tickets Report', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Exported At: ${new Date().toLocaleString()}`, 14, 30);

      // Define table columns
      const tableColumn = ["Index", "Ticket ID", "Subject", "Priority", "Status", "User", "Created At"];
      const tableRows: any[] = [];

      tickets.forEach((ticket: any, index: number) => {
        const ticketData = [
          index + 1,
          ticket.customId || ticket.id || 'N/A',
          ticket.subject || 'N/A',
          ticket.priority || 'N/A',
          ticket.status || 'N/A',
          ticket.user?.username || ticket.user?.account?.email || 'N/A',
          new Date(ticket.createdAt).toLocaleDateString()
        ];
        tableRows.push(ticketData);
      });

      // Generate Table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }, // Blue-500
        styles: { fontSize: 8 }
      });

      // Save PDF
      doc.save(`support-tickets-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Tickets report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred while exporting the report");
    } finally {
      setShowExportMenu(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const { data: exportData, isError } = await triggerExport({});

      if (isError || !exportData?.success) {
        toast.error("Failed to fetch export data");
        return;
      }

      const tickets = exportData.data || [];
      const wb = XLSX.utils.book_new();
      const wsData: any[] = [
        ["Index", "Ticket ID", "Subject", "Priority", "Status", "User", "Created At"],
        ...tickets.map((ticket: any, index: number) => [
          index + 1,
          ticket.customId || ticket.id || 'N/A',
          ticket.subject || 'N/A',
          ticket.priority || 'N/A',
          ticket.status || 'N/A',
          ticket.user?.username || ticket.user?.account?.email || 'N/A',
          new Date(ticket.createdAt).toLocaleDateString()
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Tickets');
      XLSX.writeFile(wb, `support-tickets-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Tickets report exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("An error occurred while exporting the report");
    } finally {
      setShowExportMenu(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/admin/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <HomeIcon className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-blue-600 dark:text-blue-400 font-medium">Support</span>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support Tickets Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor client-reported issues and support responsiveness.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(prev => !prev)}
            className="px-4 py-2 shadow-customShadow cursor-pointer bg-white dark:bg-gray-800 text-nowrap rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <CloudDownload className="w-4 h-4" />
            <span className="hidden lg:block">Export Report</span>
          </button>
          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-1 bg-navbarBg border border-border rounded-lg shadow-lg z-20 min-w-[140px]">
                <button onClick={handleExportPDF} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg cursor-pointer">📄 PDF</button>
                <button onClick={handleExportExcel} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg cursor-pointer">📊 Excel</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <SupportStatsGrid />

      {/* Tickets table */}
      <TicketsTable />
    </div>
  );
}
