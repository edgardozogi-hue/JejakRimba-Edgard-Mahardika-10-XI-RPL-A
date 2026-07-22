import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";
import Footer from "./Footer";

export default function PageShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="min-h-screen bg-bg">
      {showNav && <Navbar />}
      <PageTransition>
        <main className={showNav ? "pb-24 md:pb-8" : ""}>{children}</main>
      </PageTransition>
      <Footer />
      {showNav && <BottomNav />}
    </div>
  );
}
