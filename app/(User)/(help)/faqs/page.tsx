"use client";

import { useState, useMemo } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import HelpCenterHeader from '@/components/help/HelpCenterHeader';
import CategoryTabs from '@/components/help/CategoryTabs';
import { useGetAllFaqsQuery, useIncrementFaqViewMutation } from '@/redux/api/users/faqTutorialApi';

const categoryMap: any = {
    'All': undefined,
    'Device Management': 'DEVICEMANAGEMENT',
    'Content & Playlists': 'CONTENT_PLAYLIST',
    'Schedule': 'SCHEDULE',
    'Billing & Subscriptions': 'BILLANDSUBCRIPTION',
};

const FAQs = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

    const categories = ['All', 'Device Management', 'Content & Playlists', 'Schedule', 'Billing & Subscriptions'];

    // API Query
    const { data: faqsData, isLoading } = useGetAllFaqsQuery({
        search: searchQuery || undefined,
        category: categoryMap[selectedCategory],
        status: 'PUBLISHED',
        limit: 100 // Get all for grouping
    });

    const [incrementView] = useIncrementFaqViewMutation();

    const groupedFAQs = useMemo(() => {
        if (!faqsData?.data?.items) return [];

        const items = faqsData.data.items;
        const groups: { [key: string]: any[] } = {};

        items.forEach((item: any) => {
            const cat = item.category[0] || 'Uncategorized';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });

        // Map back to human readable names for display
        const reverseMap: any = {
            'DEVICEMANAGEMENT': 'Device Management',
            'CONTENT_PLAYLIST': 'Content & Playlists',
            'SCHEDULE': 'Schedule',
            'BILLANDSUBCRIPTION': 'Billing & Subscriptions',
            'SUBCRIPTION': 'Subscription',
        };

        return Object.entries(groups).map(([key, questions]) => ({
            category: reverseMap[key] || key,
            questions
        }));
    }, [faqsData]);

    const toggleQuestion = async (id: string) => {
        const isOpening = !expandedQuestions.includes(id);
        setExpandedQuestions(prev =>
            prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
        );

        if (isOpening) {
            try {
                await incrementView(id).unwrap();
            } catch (err) {
                console.error('Failed to increment view:', err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-12 w-full max-w-[1920px] mx-auto">
            <HelpCenterHeader
                title="Frequently Asked Questions"
                description="Find answers and inspiration on all things tape."
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <div className="px-4 sm:px-6 lg:px-8 mb-8">
                <CategoryTabs
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                {/* FAQ Sections */}
                <div className="space-y-12">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
                        </div>
                    ) : groupedFAQs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No questions found matching your search.</p>
                        </div>
                    ) : (
                        groupedFAQs.map((section) => (
                            <div key={section.category}>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                    {section.category}
                                </h2>
                                <div className="divide-y divide-gray-200 dark:divide-gray-800 border-t border-b border-gray-200 dark:border-gray-800">
                                    {section.questions.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(item.id)}
                                                className="w-full py-4 flex items-start justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors px-2 cursor-pointer"
                                            >
                                                <span className="text-base font-medium text-gray-900 dark:text-white pr-4">
                                                    {item.question}
                                                </span>
                                                <ChevronRight
                                                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 cursor-pointer ${expandedQuestions.includes(item.id) ? 'rotate-90' : ''
                                                        }`}
                                                />
                                            </button>
                                            {expandedQuestions.includes(item.id) && (
                                                <div className="pb-4 px-2">
                                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                                                        {item.answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default FAQs;