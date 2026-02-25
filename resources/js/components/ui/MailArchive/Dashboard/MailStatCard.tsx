import React from 'react';

export const MailStatCard = ({ color, label, value, icon: Icon }: any) => {
    const colors = {
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow border border-gray-100 dark:border-gray-700">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${colors[color as keyof typeof colors]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">{label}</p>
            <p className="font-bold text-xl text-gray-800 dark:text-gray-100 truncate">
                {Number(value).toLocaleString('id-ID')}
            </p>
        </div>
    );
};