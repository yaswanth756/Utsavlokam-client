/* src/pages/Listings.jsx */
import React from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import ResultsGrid from '../components/ListingsPage/ResultsGrid';
import Footer from '../components/Footer';

const Listings = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <SEO
        title="Browse Event Services | Utsavlokam"
        description="Explore and book from thousands of verified event service providers. Find photographers, caterers, venues, decorators, and more for your special events."
        keywords="browse event services, find photographers, book caterers, event venues, wedding services, party planners"
        canonical={`https://www.utsavlokam.com${location.pathname}${location.search}`}
      />
      <div className='bg-gray-50'>
      </div>
      {/* No more fixed sidebar - everything is now integrated into ResultsGrid */}
      <ResultsGrid />

      <Footer />
    </div>
  );
};

export default Listings;
