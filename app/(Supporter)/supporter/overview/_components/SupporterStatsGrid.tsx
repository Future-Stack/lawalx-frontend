import { LayoutGrid, ClipboardCheck, Clock, Folders, FileText } from 'lucide-react';
import SupporterStatCard from './SupporterStatCard';

const stats = [
  {
    id: 'assigned',
    icon: <Folders className="w-5 h-5 text-white" />,
    iconBg: 'bg-[#0151FFD6]',
    title: 'Total Assigned Ticket',
    value: 156,
  },
  {
    id: 'resolved',
    icon: <ClipboardCheck className="w-5 h-5 text-white" />,
    iconBg: 'bg-[#069576]',
    title: 'Ticket Resolved',
    value: 75,
  },
  {
    id: 'inprogress',
    icon: <FileText className="w-5 h-5 text-white" />,
    iconBg: 'bg-[#F5B31A]',
    title: 'Ticket In Progress',
    value: 15,
  },
];

export default function SupporterStatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <SupporterStatCard
          key={stat.id}
          icon={stat.icon}
          iconBg={stat.iconBg}
          title={stat.title}
          value={stat.value}
        />
      ))}
    </div>
  );
}
