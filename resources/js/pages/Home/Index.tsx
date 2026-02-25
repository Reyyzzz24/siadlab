import React from 'react';
import { Head } from '@inertiajs/react';
import { EventItem } from '@/types';

// Import semua partials yang telah dibuat
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
}

const Home: React.FC<Props> = ({ events, draftEvents }) => {
    return (
        <>
            <Head title="Home - SIADLAB FILKOM UNIDA" />

            <Navbar />

            <main>
                <Hero />
                <Services />
                <UpcomingEvent events={events} />
                <About />
                <Contact />
            </main>

            <Footer />
        </>
    );
};

export default Home;