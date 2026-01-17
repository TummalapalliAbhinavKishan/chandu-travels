import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Clock, Shield, Star, MapPin, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import templeHero from "@/assets/temple-hero.jpg";
import cabIcon from "@/assets/cab-icon.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${templeHero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-0" />
        
        <div className="container mx-auto px-4 z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Journey to Divine Blessings
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-md">
              Premium Cab Services to Tirumala Balaji Temple
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/booking">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-divine"
                >
                  Book Your Ride Now
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm text-white border-white/50 hover:bg-white/20"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose Chandu Travels?</h2>
          <p className="text-muted-foreground text-lg">Your comfort and safety are our top priorities</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-divine transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Premium Vehicles</h3>
              <p className="text-muted-foreground">
                Well-maintained, comfortable cars for a smooth journey
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-divine transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Service</h3>
              <p className="text-muted-foreground">
                Available round the clock for your convenience
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-divine transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Experienced drivers ensuring your safety throughout
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-divine transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Professional Service</h3>
              <p className="text-muted-foreground">
                Courteous and knowledgeable drivers at your service
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-divine transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Local Expertise</h3>
              <p className="text-muted-foreground">
                Best routes and temple area knowledge
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-divine transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Group Travel</h3>
              <p className="text-muted-foreground">
                Accommodations for families and groups
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready for Your Divine Journey?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Book your comfortable ride to Tirumala Balaji Temple now and experience hassle-free travel
          </p>
          <Link to="/booking">
            <Button
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-divine"
            >
              Book Your Cab Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
