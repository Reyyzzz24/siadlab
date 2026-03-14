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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulasi loading awal saat komponen pertama kali di-mount
        const timer = setTimeout(() => setLoading(false), 2000);

        // Event listener untuk navigasi Inertia
        const start = router.on('start', () => setLoading(true));
        const finish = router.on('finish', () => {
            setTimeout(() => setLoading(false), 1500);
        });

        return () => {
            clearTimeout(timer);
            start();
            finish();
        };
    }, []);

    return (
        <>
            <Head title="Home - SIADLAB FILKOM UNIDA" />

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