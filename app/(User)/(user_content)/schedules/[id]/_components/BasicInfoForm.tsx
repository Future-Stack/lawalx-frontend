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
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            
            {/* Divider */}
            <div className="h-px w-full bg-gray-200 dark:bg-gray-700 mb-5" />

            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Name *
                    </label>
                    <input
                        type="text"
                        placeholder="Store A - NYC"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 placeholder:text-gray-400 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Description
                    </label>
                    <textarea
                        placeholder="Store A - NYC"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 placeholder:text-gray-400 transition-colors resize-y"
                    />
                </div>
            </div>
        </section>
    );
};

export default BasicInfoForm;
