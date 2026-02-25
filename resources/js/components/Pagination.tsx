import { Link } from '@inertiajs/react';
import React from 'react';

interface Props {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export function Pagination({ links }: Props) {
    if (links.length <= 3) return null;

    // Filter untuk membuang link yang mengandung kata 'Previous' atau 'Next'
    const pageLinks = links.filter(link => 
        !link.label.includes('Previous') && !link.label.includes('Next')
    );

    return (
        <div className="flex justify-center mt-6">
            <nav className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <ul className="flex items-center text-gray-600 dark:text-gray-300 gap-2 font-medium">
                    {pageLinks.map((link, key) => (
                        <li key={key}>
                            {link.url === null ? (
                                <span 
                                    className="px-4 py-2 text-gray-300 dark:text-gray-600 cursor-not-allowed text-sm"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <Link
                                    href={link.url}
                                    preserveScroll
                                    className={`
                                        rounded-full px-4 py-2 text-sm transition duration-300 ease-in-out flex items-center justify-center
                                        ${link.active 
                                            ? 'bg-white dark:bg-gray-700 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' 
                                            : 'hover:bg-white dark:hover:bg-gray-700 dark:hover:text-white'
                                        }
                                    `}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}