import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick }) => {
  const { isPaidUser, isLoggedIn, user, logout } = useAuth(); // Use the auth context

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="PureCut AI" className="h-[80px]" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          {isPaidUser && ( // Conditionally render History button
            <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              History
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted-foreground hidden lg:inline-block">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onLoginClick}>Log in</Button>
              <Button variant="cta" size="sm" onClick={onRegisterClick}>Get Started Free</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
