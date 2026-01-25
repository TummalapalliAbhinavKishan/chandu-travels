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
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  pickup_location: z.string().min(3),
  drop_location: z.string().min(3),
  passengers: z.number().min(1),
  special_requests: z.string().optional(),
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

      /* 1️⃣ INSERT BOOKING */
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          ...validated,
          pickup_date: format(date, "yyyy-MM-dd"),
          pickup_time: time,
          status: "pending",
        })
        .select("*")
        .single();

      if (error) throw error;

      /* 2️⃣ CALL EDGE FUNCTION (THIS WAS MISSING) */
     const { error: emailError } = await supabase.functions.invoke(
  "send-booking-email",
  {
    body: {
      email: data.email,
      booking_id: data.id,
      name: data.name,
       phone: data.phone, 
      pickup_location: data.pickup_location,
      drop_location: data.drop_location,
      pickup_date: data.pickup_date,
      pickup_time: data.pickup_time,
      status: data.status,
    },
  }
);

if (emailError) {
  console.error("EMAIL FUNCTION ERROR FULL:", emailError);
}


      /* 3️⃣ SUCCESS UI */
      toast.success("Booking confirmed! Email sent 📧");
      setTimeout(() => navigate("/"), 2500);

    } catch (err: any) {
      console.error("BOOKING ERROR:", err);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Book Your Cab</CardTitle>
            <CardDescription>Fill travel details</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input placeholder="Pickup location" value={formData.pickup_location} onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })} />
              <Input placeholder="Drop location" value={formData.drop_location} onChange={(e) => setFormData({ ...formData, drop_location: e.target.value })} />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" selected={date} onSelect={setDate} />
                </PopoverContent>
              </Popover>

              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Pickup time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                      {i}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea placeholder="Special requests" value={formData.special_requests} onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })} />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Booking;
