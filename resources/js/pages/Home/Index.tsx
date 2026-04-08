import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { EventItem } from '@/types';
import { LoadingScreen } from '@/components/loading-screen';

// Import semua partials
import Navbar from './Partials/Navbar';
import Hero from './Partials/Hero';
import About from './Partials/AboutUs';
import UpcomingEvent from './Partials/UpcomingEvent';
import Contact from './Partials/Contact';
import Footer from './Partials/Footer';
import Services from './Partials/Services';

interface Props {
    events: EventItem[];
    draftEvents: EventItem[];
    heroSections: any[];
}

const Home: React.FC<Props> = ({ events, draftEvents, heroSections }) => {
    // 1. Biarkan default true untuk initial load
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 2. Simulasi loading hanya sekali saat komponen di-mount (Hard Refresh)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        // Bersihkan timer saat komponen unmount
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Head title="Home - SIADLAB FILKOM UNIDA" />

            {/* Loading screen hanya muncul selama state 'loading' true di awal */}
            {loading && <LoadingScreen />}

            <div className={`transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                <Navbar />
                <main>
                    <Hero heroSections={heroSections} />
                    <Services />
                    <UpcomingEvent events={events} />
                    <About />
                    <Contact />
                </main>
                <Footer />
            </div>
        </>
    );
};

export default Home;