// components/ui/ItemLending/StatCard.tsx
export const StatCard = ({ color, label, value }: any) => {
    const colors: any = {
        blue: "bg-blue-300 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        red: "bg-red-300 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        amber: "bg-amber-300 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        green: "bg-green-300 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };

    const lowercaseLabel = label.toLowerCase();
    const isDeadline = lowercaseLabel.includes('tempo') || lowercaseLabel.includes('jadwal');
    const isLabOrItem = lowercaseLabel.includes('lab') || lowercaseLabel.includes('barang');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow border border-gray-100 dark:border-gray-700">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${colors[color]}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {isDeadline ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                    ) : isLabOrItem ? (
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    )}
                </svg>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">{label}</p>
            <p className="font-bold text-xl text-gray-800 dark:text-gray-100 truncate">
                {typeof value === 'string' ? value : value?.toLocaleString('id-ID')}
            </p>
        </div>
    );
};