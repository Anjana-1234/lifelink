import Navbar  from './Navbar';
import Footer  from './Footer';

// Layout wraps all private pages
// Navbar at top, Footer at bottom, page content in middle
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar — always visible at top */}
      <Navbar />

      {/* Page content — grows to fill available space */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer — always at bottom */}
      <Footer />
    </div>
  );
};

export default Layout;