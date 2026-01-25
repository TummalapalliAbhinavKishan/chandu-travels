import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Loader2, Navigation as NavigationIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Booking {
  id: string;
  order_number: string;
  name: string;
  pickup_location: string;
  drop_location: string;
  status: string;
}

const UpdateLocation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  // 🔐 ADMIN AUTH CHECK (profiles.role ONLY)
  const checkAdmin = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || data?.role !== "admin") {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      // ✅ Admin verified
      fetchActiveBookings();
    } catch {
      navigate("/admin/login");
    }
  };

  const fetchActiveBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, order_number, name, pickup_location, drop_location, status"
        )
        .in("status", ["confirmed", "in_progress"])
        .order("pickup_date", { ascending: true });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);

    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setGettingLocation(false);
        toast({
          title: "Location Retrieved",
          description: "Current location captured.",
        });
      },
      () => {
        toast({
          title: "Location Error",
          description: "Unable to fetch location. Enter manually.",
          variant: "destructive",
        });
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBookingId || !latitude || !longitude) {
      toast({
        title: "Missing Information",
        description: "Please select booking and enter coordinates.",
        variant: "destructive",
      });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Invalid Coordinates",
        description: "Enter valid latitude and longitude.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase.from("driver_locations").insert({
        booking_id: selectedBookingId,
        latitude: lat,
        longitude: lng,
      });

      if (error) throw error;

      toast({
        title: "Location Updated",
        description: "Driver location updated successfully.",
      });

      setLatitude("");
      setLongitude("");
    } catch {
      toast({
        title: "Error",
        description: "Failed to update location.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-primary" />
                Update Driver Location
              </CardTitle>
              <CardDescription>
                Update live GPS location for active bookings
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpdateLocation} className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Booking</Label>
                  <Select
                    value={selectedBookingId}
                    onValueChange={setSelectedBookingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose booking..." />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.order_number} - {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between">
                    <Label>GPS Coordinates</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                    >
                      {gettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <NavigationIcon className="h-4 w-4 mr-2" />
                      )}
                      Use My Location
                    </Button>
                  </div>

                  <Input
                    placeholder="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                  <Input
                    placeholder="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updating || !selectedBookingId}
                >
                  {updating ? "Updating..." : "Update Location"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateLocation;
