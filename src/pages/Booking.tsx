import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(10, "Phone must be at least 10 digits").max(15),
  pickup_location: z.string().trim().min(3, "Pickup location is required").max(200),
  drop_location: z.string().trim().min(3, "Drop location is required").max(200),
  passengers: z.number().min(1).max(20),
  special_requests: z.string().max(500).optional(),
});

const Booking = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickup_location: "",
    drop_location: "",
    passengers: 1,
    special_requests: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Please select date and time");
      return;
    }

    try {
      const validated = bookingSchema.parse(formData);
      setIsSubmitting(true);

      const { data, error } = await supabase.from("bookings").insert([{
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        pickup_location: validated.pickup_location,
        drop_location: validated.drop_location,
        pickup_date: format(date, "yyyy-MM-dd"),
        pickup_time: time,
        passengers: validated.passengers,
        special_requests: validated.special_requests || null,
      }]).select("order_number");

      if (error) throw error;

      const orderNumber = data?.[0]?.order_number;
      const trackingUrl = `${window.location.origin}/track/${orderNumber}`;
      
      toast.success(
        `Booking confirmed! Order: ${orderNumber}`,
        {
          description: "Track your ride at: " + trackingUrl,
          duration: 10000,
        }
      );
      
      // Copy tracking link to clipboard
      navigator.clipboard.writeText(trackingUrl);
      
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to submit booking. Please try again.");
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Book Your Cab</h1>
            <p className="text-muted-foreground">Fill in the details below to reserve your ride</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Enter your travel information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Location *</Label>
                  <Input
                    id="pickup"
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                    placeholder="e.g., Chennai"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drop">Drop Location *</Label>
                  <Input
                    id="drop"
                    value={formData.drop_location}
                    onChange={(e) => setFormData({ ...formData, drop_location: e.target.value })}
                    placeholder="e.g., Tirumala Temple"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pickup Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date) => date < new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Pickup Time *</Label>
                    <Select value={time} onValueChange={setTime} required>
                      <SelectTrigger>
                        <Clock className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                          <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                            {hour.toString().padStart(2, "0")}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengers">Number of Passengers *</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requests">Special Requests (Optional)</Label>
                  <Textarea
                    id="requests"
                    value={formData.special_requests}
                    onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                    placeholder="Any specific requirements or preferences..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Booking"}
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

export default Booking;
