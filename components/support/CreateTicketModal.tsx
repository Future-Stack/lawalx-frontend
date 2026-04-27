// components/support/CreateTicketModal.tsx
import { X, Paperclip } from "lucide-react";
import { useState, useRef } from "react";
import Dropdown from "@/components/shared/Dropdown";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    issueType: string;
    subject: string;
    message: string;
    file?: File | null;
  }) => void;
}

export default function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateTicketModalProps) {
  const [issueType, setIssueType] = useState("Device");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const mapIssueType = (type: string) => {
    switch (type) {
      case "Device": return "DEVICE_ISSUE";
      case "Login": return "ACCOUNT_ISSUE";
      case "Content": return "CONTENT_ISSUE";
      case "Payment": return "PAYMENT_ISSUE";
      case "Technical": return "TECHNICAL_ISSUE";
      case "Storage": return "STORAGE_ISSUE";
      default: return "OTHER";
    }
  };

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) return;
    onSubmit({ issueType: mapIssueType(issueType), subject, message, file: attachedFile });
    
    // Reset states for next time
    setSubject("");
    setMessage("");
    setAttachedFile(null);
    setIssueType("Device");
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Report a Problem
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Issue Type
            </label>
            <Dropdown
              value={issueType}
              options={["Device", "Login", "Content", "Payment", "Technical", "Storage", "Other"]}
              onChange={setIssueType}
              className="w-full"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Message */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Message
            </label>

            <div className="relative">
              {/* Textarea */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full px-4 pt-3 pb-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12"
              />

              {/* Attachment Button - Bottom Left Inside */}
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) =>
                    e.target.files?.[0] && setAttachedFile(e.target.files[0])
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Attached File Preview - Inside textarea, just above button */}
                {attachedFile && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs max-w-[200px]">
                    <Paperclip className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
                    <span className="truncate text-blue-700 dark:text-blue-400">
                      {attachedFile.name}
                    </span>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
