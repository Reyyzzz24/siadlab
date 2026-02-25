import React from 'react';

const Footer: React.FC = () => {
    // Mendapatkan tahun secara dinamis
    const currentYear = new Date().getFullYear();

    return (
        /* Perubahan: 
           - dark:bg-black (atau background) untuk menyesuaikan dengan tema gelap pekat.
           - border-t tetap halus dengan opacity rendah.
        */
        <footer className="bg-background dark:bg-background transition-colors duration-500 pt-12 pb-8">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Border atas yang menyesuaikan warna di mode gelap */}
                <div className="flex justify-center border-t border-gray-200 dark:border-zinc-600/50 pt-8">
                    <p className="text-center text-sm leading-6 text-gray-400 dark:text-zinc-500">
                        &copy; {currentYear} SIADLAB. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;