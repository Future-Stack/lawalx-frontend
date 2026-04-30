import React from 'react';

interface TicketListProps {
  tickets: any[];
  isLoading: boolean;
  selectedTicketId: string | null;
  onTicketSelect: (ticket: any) => void;
  showChatOnMobile: boolean;
  getStatusColor: (status: string) => string;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  isLoading,
  selectedTicketId,
  onTicketSelect,
  showChatOnMobile,
  getStatusColor,
}) => {
  return (
    <div className={`w-full lg:w-1/2 border-r border-gray-200 dark:border-gray-700 flex-col ${showChatOnMobile ? 'hidden lg:flex' : 'flex'}`}>
      <div className="h-full overflow-y-auto scrollbar-hide">
        <table className="w-full">
          <thead className="bg-cardBackground2 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <tr className="h-20">
              <th className="px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Ticket ID
              </th>
              <th className="px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Issue Type
              </th>
              <th className="px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Loading tickets...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No tickets found.</td>
              </tr>
            ) : (
              tickets.map((ticket: any) => (
                <tr
                  key={ticket.id}
                  onClick={() => onTicketSelect(ticket)}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedTicketId === ticket.id
                    ? "bg-blue-50/60 dark:bg-blue-800/30"
                    : ""
                    }`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.customId || ticket.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {Array.isArray(ticket.issueType) ? ticket.issueType.join(', ') : ticket.issueType}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-2.5 text-xs font-medium rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketList;
