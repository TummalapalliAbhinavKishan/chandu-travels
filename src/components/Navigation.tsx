import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";

const Navigation = () => {
  const phoneNumber = "+917799040143"; // Replace with actual number
  const whatsappNumber = "917799040143"; // Replace with actual number

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/home" className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Chandu Travels
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/home" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/services" className="text-foreground hover:text-primary transition-colors">
              Services
            </Link>
            <Link to="/booking" className="text-foreground hover:text-primary transition-colors">
              Book Now
            </Link>
            <Link
  to="/rental"
  className="text-foreground hover:text-primary transition-colors"
>
  Rent a Car
</Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => window.location.href = `tel:${phoneNumber}`}
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call Now</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
