import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addPdfHeader } from "@/lib/pdfUtils";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ExportArgs {
  triggerExport: (args: any) => Promise<any>;
  searchTerm: string;
  statusFilter: string;
  planFilter: string;
  storageFilter: number;
}

export const handleExportPDF = async ({
  triggerExport,
  searchTerm,
  statusFilter,
  planFilter,
  storageFilter,
}: ExportArgs) => {
  try {
    const normalizedPlan =
      planFilter === "All Plans"
        ? undefined
        : planFilter === "Free" || planFilter === "Free Trial"
        ? "FREE_TRIAL"
        : planFilter.toUpperCase().replace(" ", "_");

    const { data: exportData, isError } = await triggerExport({
      search: searchTerm,
      status: statusFilter,
      plan: normalizedPlan,
      storageUsage: storageFilter,
    });

    if (isError || !exportData?.success) {
      toast.error("Failed to fetch export data");
      return;
    }

    const users = exportData.data?.users?.users || [];
    const doc = new jsPDF();

    // Branded header with logo
    const startY = await addPdfHeader(doc, 'User Management Report', `Exported: ${new Date().toLocaleString()}`);

    // Define table columns
    const tableColumn = ["Index", "Name", "Email", "Plan", "Role", "Status"];
    const tableRows: any[] = [];

    users.forEach((user: any, index: number) => {
      const userData = [
        index + 1,
        user.full_name || user.username || 'N/A',
        user.account?.email || 'N/A',
        user.plan || 'No Plan',
        user.role || 'N/A',
        user.status || 'N/A'
      ];
      tableRows.push(userData);
    });

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 }
    });

    // Save PDF
    doc.save(`user-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("User report exported successfully");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("An error occurred while exporting the report");
  }
};

export const handleExportExcel = async ({
  triggerExport,
  searchTerm,
  statusFilter,
  planFilter,
  storageFilter,
}: ExportArgs) => {
  try {
    const normalizedPlan =
      planFilter === "All Plans"
        ? undefined
        : planFilter === "Free" || planFilter === "Free Trial"
        ? "FREE_TRIAL"
        : planFilter.toUpperCase().replace(" ", "_");

    const { data: exportData, isError } = await triggerExport({
      search: searchTerm,
      status: statusFilter,
      plan: normalizedPlan,
      storageUsage: storageFilter,
    });

    if (isError || !exportData?.success) {
      toast.error("Failed to fetch export data");
      return;
    }

    const users = exportData.data?.users?.users || [];
    const wb = XLSX.utils.book_new();
    const wsData: any[] = [
      ["Index", "Name", "Email", "Plan", "Role", "Status"],
      ...users.map((user: any, index: number) => [
        index + 1,
        user.full_name || user.username || 'N/A',
        user.account?.email || 'N/A',
        user.plan || 'No Plan',
        user.role || 'N/A',
        user.status || 'N/A'
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, `user-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("User report exported successfully");
  } catch (error) {
    console.error("Excel export error:", error);
    toast.error("An error occurred while exporting the report");
  }
};
