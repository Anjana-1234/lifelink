import Navbar from './Navbar';

// ── Layout Component ──────────────────────────────────────────
// Wraps all private pages with the Navbar
// Usage: <Layout><YourPage /></Layout>
//
// This pattern is called "layout component" — very common in React apps
// Instead of adding <Navbar /> to every page, we wrap once here
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar appears on top of every private page */}
      <Navbar />

      {/* children = the actual page content passed between tags */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;