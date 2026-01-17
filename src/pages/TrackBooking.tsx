import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Users, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Booking {
  id: string;
  order_number: string;
  name: string;
  email: string;
  phone: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  pickup_time: string;
  passengers: number;
  status: string;
  special_requests?: string;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  updated_at: string;
}

const TrackBooking = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      navigate("/");
      return;
    }

    fetchBookingData();
    subscribeToLocationUpdates();
  }, [orderNumber]);

  const fetchBookingData = async () => {
    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("order_number", orderNumber)
        .single();

      if (bookingError) throw bookingError;

      if (!bookingData) {
        toast({
          title: "Booking Not Found",
          description: "No booking found with this order number.",
          variant: "destructive",
        });
        return;
      }

      setBooking(bookingData);

      // Fetch latest driver location
      const { data: locationData, error: locationError } = await supabase
        .from("driver_locations")
        .select("*")
        .eq("booking_id", bookingData.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (!locationError && locationData) {
        setLocation(locationData);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLocationUpdates = () => {
    const channel = supabase
      .channel("driver-location-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_locations",
        },
        (payload) => {
          if (payload.new && booking && (payload.new as any).booking_id === booking.id) {
            setLocation(payload.new as DriverLocation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-yellow-500";
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const openInGoogleMaps = () => {
    if (location) {
      window.open(
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
        "_blank"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Booking Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No booking found with order number: {orderNumber}
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Order Number: <span className="font-mono font-semibold">{booking.order_number}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Passenger Name</p>
                  <p className="font-medium">{booking.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{booking.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{booking.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Passengers</p>
                  <p className="font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {booking.passengers}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                    <p className="font-medium">{booking.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Drop Location</p>
                    <p className="font-medium">{booking.drop_location}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Date</p>
                    <p className="font-medium">
                      {new Date(booking.pickup_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Time</p>
                    <p className="font-medium">{formatTime(booking.pickup_time)}</p>
                  </div>
                </div>
              </div>

              {booking.special_requests && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Special Requests</p>
                  <p className="font-medium">{booking.special_requests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Live Driver Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {location ? (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Latitude</span>
                      <span className="font-mono font-medium">{location.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Longitude</span>
                      <span className="font-mono font-medium">{location.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm font-medium">
                        {new Date(location.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button onClick={openInGoogleMaps} className="w-full">
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Google Maps
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Driver location not available yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Location tracking will appear once your driver starts the trip.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackBooking;
