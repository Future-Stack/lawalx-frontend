import React from "react";

interface BasicInfoFormProps {
    name: string;
    setName: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ name, setName, description, setDescription }) => {
    return (
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Information</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Define the basic identity of this content schedule.
                </p>
            </div>
            
            {/* Divider */}
            <div className="h-px w-full bg-gray-200 dark:bg-gray-700 mb-5" />

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Schedule Name *
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Morning Promotions - Store A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bgBlue/10 dark:focus:ring-bgBlue/20 placeholder:text-gray-400 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Description
                    </label>
                    <textarea
                        placeholder="Describe the purpose of this schedule..."
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bgBlue/10 dark:focus:ring-bgBlue/20 placeholder:text-gray-400 transition-all resize-none thin-gray-scrollbar leading-relaxed"
                    />
                </div>
            </div>
        </section>
    );
};

export default BasicInfoForm;
