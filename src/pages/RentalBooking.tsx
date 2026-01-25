import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const RentalBooking = () => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    pickup_location: "",
    start_date: "",
    end_date: "",
    car_type: "",
  });

  const submitRental = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ Insert rental booking
    const { data, error } = await supabase
      .from("rental_bookings")
      .insert([{ ...form }])
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      toast.error("Rental booking failed");
      setLoading(false);
      return;
    }

    // 2️⃣ Trigger RENTAL EMAIL (Gmail + Nodemailer Edge Function)
    const { error: emailError } = await supabase.functions.invoke(
      "send-rental-email",
      {
        body: {
          rental_id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          pickup_location: data.pickup_location,
          car_type: data.car_type,
          start_date: data.start_date,
          end_date: data.end_date,
        },
      }
    );

    if (emailError) {
      console.error("Email error:", emailError);
      toast.warning("Booking saved, but email failed");
    } else {
      toast.success("Rental booking confirmed! Email sent 📧");
    }

    // 3️⃣ Reset form
    setForm({
      name: "",
      email: "",
      phone: "",
      pickup_location: "",
      start_date: "",
      end_date: "",
      car_type: "",
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-28 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Rent a Car</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={submitRental} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />

              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                required
              />

              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                required
              />

              <Input
                placeholder="Pickup Location"
                value={form.pickup_location}
                onChange={(e) =>
                  setForm({ ...form, pickup_location: e.target.value })
                }
                required
              />

              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                required
              />

              <Label>End Date</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
                required
              />

              <Input
                placeholder="Car Type (Sedan, SUV...)"
                value={form.car_type}
                onChange={(e) =>
                  setForm({ ...form, car_type: e.target.value })
                }
                required
              />

              <Button disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Rental"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default RentalBooking;
