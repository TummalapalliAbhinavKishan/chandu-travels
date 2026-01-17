import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Car, Clock, MapPin, Users, Shield, Star, Calendar, Headphones } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive cab services tailored for your spiritual journey to Tirumala
          </p>
        </div>

        {/* Main Services */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-divine transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Local Temple Transfers</CardTitle>
              <CardDescription>
                Direct rides from major cities to Tirumala Balaji Temple
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pickup from Chennai, Bangalore, Hyderabad</li>
                <li>• Drop at temple entrance</li>
                <li>• Comfortable AC vehicles</li>
                <li>• Experienced local drivers</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-divine transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 mb-4 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>24/7 Availability</CardTitle>
              <CardDescription>
                Round-the-clock service for your convenience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Early morning temple visits</li>
                <li>• Late night pickups</li>
                <li>• Instant booking confirmation</li>
                <li>• No surge pricing</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-divine transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 mb-4 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Group Travel Packages</CardTitle>
              <CardDescription>
                Special arrangements for families and groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• SUVs and Tempo Travellers</li>
                <li>• Customized itineraries</li>
                <li>• Group discounts available</li>
                <li>• Multiple pickup points</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-divine transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Local Sightseeing</CardTitle>
              <CardDescription>
                Explore nearby attractions with our guided tours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Sri Kalahasti Temple</li>
                <li>• Chandragiri Fort</li>
                <li>• Talakona Waterfalls</li>
                <li>• TTD Gardens</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Tirumala Travels?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Safe & Secure</h3>
                <p className="text-sm text-muted-foreground">Verified drivers and GPS tracking</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 mx-auto mb-3 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">5-Star Rating</h3>
                <p className="text-sm text-muted-foreground">1000+ satisfied customers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 mx-auto mb-3 bg-accent/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Easy Booking</h3>
                <p className="text-sm text-muted-foreground">Quick online reservation</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">Always here to help</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Journey?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Experience hassle-free travel to Tirumala with our premium cab services
          </p>
          <Link to="/booking">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-divine">
              Book Your Ride Now
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;
