// components/Dashboard/StatCard.tsx
export const StatCard = ({ color, label, value, isCurrency = false }: any) => {
    const colors = {
        blue: "bg-blue-300 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        red: "bg-red-300 text-red-800 dark:bg-red-900 dark:text-red-200",
        green: "bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-200",
    };

    // Logika deteksi ikon berdasarkan kata kunci di label
    const isPayment = label.toLowerCase().includes('tagihan') || label.toLowerCase().includes('bayar');
    const isDeadline = label.toLowerCase().includes('tempo');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow border border-gray-100 dark:border-gray-700">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${colors[color as keyof typeof colors]}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isPayment ? (
                        /* Ikon Dompet/Wallet */
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    ) : isDeadline ? (
                        /* Ikon Kalender */
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                    ) : (
                        /* Ikon User (Default) */
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    )}
                </svg>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">{label}</p>
            <p className="font-bold text-xl text-gray-800 dark:text-gray-100 truncate">
                {isCurrency || typeof value === 'string' ? value : value?.toLocaleString('id-ID')}
            </p>
        </div>
    );
};