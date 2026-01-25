import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- TYPES ---------------- */

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  pickup_location: string;
  drop_location: string;
  pickup_date: string;
  pickup_time: string;
  passengers: number;
  status: string | null;
  special_requests: string | null;
  created_at: string;
}

interface RentalBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  pickup_location: string;
  start_date: string;
  end_date: string;
  car_type: string;
  status: string | null;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const AdminDashboard = () => {
  /* ---------------- STATES ---------------- */
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rentals, setRentals] = useState<RentalBooking[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      fetchData();
    };

    checkAdmin();
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  const fetchData = async () => {
    try {
      const [bookingsRes, rentalsRes, messagesRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false }),

        supabase
          .from("rental_bookings")
          .select("*")
          .eq("is_deleted", false)
          .order("created_at", { ascending: false }),

        supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (rentalsRes.error) throw rentalsRes.error;
      if (messagesRes.error) throw messagesRes.error;

      setBookings(bookingsRes.data || []);
      setRentals(rentalsRes.data || []);
      setMessages(messagesRes.data || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600",
      confirmed: "bg-green-500/10 text-green-600",
      in_progress: "bg-blue-500/10 text-blue-600",
      completed: "bg-gray-500/10 text-gray-600",
      cancelled: "bg-red-500/10 text-red-600",
    };
    return map[status] || map.pending;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  /* ---------------- BOOKING ACTIONS ---------------- */

  const updateBookingStatus = async (id: string, status: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );

    await supabase.from("bookings").update({ status }).eq("id", id);
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm("Delete this booking?")) return;

    setBookings((prev) => prev.filter((b) => b.id !== id));

    await supabase.from("bookings").update({ is_deleted: true }).eq("id", id);
  };

  const resendEmail = async (booking: Booking) => {
  try {
    const { error } = await supabase.functions.invoke(
      "send-booking-email",
      {
        body: {
          booking_id: booking.id,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          pickup_location: booking.pickup_location,
          drop_location: booking.drop_location,
          pickup_date: booking.pickup_date,
          pickup_time: booking.pickup_time,
          status: booking.status || "confirmed",
        },
      }
    );

    if (error) throw error;

    toast({
      title: "Email Sent 📧",
      description: `Confirmation email resent to ${booking.email}`,
    });
  } catch (err) {
    console.error("Resend email error:", err);
    toast({
      title: "Failed to send email",
      description: "Please try again",
      variant: "destructive",
    });
  }
};


  /* ---------------- RENTAL ACTIONS ---------------- */

  const updateRentalStatus = async (id: string, status: string) => {
    setRentals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    await supabase
      .from("rental_bookings")
      .update({ status })
      .eq("id", id);
  };

  const resendRentalEmail = async (rental: RentalBooking) => {
  try {
    const { error } = await supabase.functions.invoke(
      "send-rental-email",
      {
        body: {
          rental_id: rental.id,
          name: rental.name,
          email: rental.email,
          phone: rental.phone,
          pickup_location: rental.pickup_location,
          car_type: rental.car_type,
          start_date: rental.start_date,
          end_date: rental.end_date,
          status: rental.status || "confirmed",
        },
      }
    );

    if (error) throw error;

    toast({
      title: "Email Sent 📧",
      description: `Rental confirmation resent to ${rental.email}`,
    });
  } catch (err) {
    console.error("Resend rental email error:", err);
    toast({
      title: "Failed to send email",
      description: "Please try again",
      variant: "destructive",
    });
  }
};


  const deleteRental = async (id: string) => {
    if (!window.confirm("Delete this rental booking?")) return;

    setRentals((prev) => prev.filter((r) => r.id !== id));

    await supabase
      .from("rental_bookings")
      .update({ is_deleted: true })
      .eq("id", id);
  };

  /* ---------------- FILTER ---------------- */
  const filteredBookings = bookings;

  if (isLoading) {
    return <div className="flex justify-center p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="rentals">Rentals</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* BOOKINGS */}
          <TabsContent value="bookings">
            <AnimatePresence>
              {filteredBookings.map((b) => (
                <motion.div key={b.id}>
                  <Card className="mb-5">
                    <CardHeader>
                      <CardTitle>{b.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p>📞 {b.phone}</p>
                      <p>📧 {b.email}</p>
                      <p>
                        📍 {b.pickup_location} → {b.drop_location}
                      </p>
                      <p>
                        📅 {b.pickup_date} ⏰ {b.pickup_time}
                      </p>
                      <p>👥 Passengers: {b.passengers}</p>

                      <Badge className={getStatusColor(b.status || "pending")}>
                        {b.status || "pending"}
                      </Badge>

                      <div className="flex gap-3 pt-2 flex-wrap">
                        <select
                          value={b.status || "pending"}
                          onChange={(e) =>
                            updateBookingStatus(b.id, e.target.value)
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendEmail(b)}
                        >
                          📧 Resend Email
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBooking(b.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </TabsContent>

          {/* RENTALS */}
          <TabsContent value="rentals">
            <AnimatePresence>
              {rentals.map((r) => (
                <motion.div key={r.id}>
                  <Card className="mb-5">
                    <CardHeader>
                      <CardTitle>{r.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>📞 {r.phone}</p>
                      <p>📍 {r.pickup_location}</p>
                      <p>🚗 {r.car_type}</p>
                      <p>
                        📅 {r.start_date} → {r.end_date}
                      </p>

                      <Badge className={getStatusColor(r.status || "pending")}>
                        {r.status || "pending"}
                      </Badge>

                      <div className="flex gap-3 pt-2 flex-wrap">
  <select
    value={r.status || "pending"}
    onChange={(e) =>
      updateRentalStatus(r.id, e.target.value)
    }
    className="border rounded px-2 py-1 text-sm"
  >
    {STATUS_OPTIONS.map((s) => (
      <option key={s.value} value={s.value}>
        {s.label}
      </option>
    ))}
  </select>

  <Button
    size="sm"
    variant="outline"
    onClick={() => resendRentalEmail(r)}
  >
    📧 Resend Email
  </Button>

  <Button
    size="sm"
    variant="destructive"
    onClick={() => deleteRental(r.id)}
  >
    <Trash2 className="h-4 w-4 mr-1" />
    Delete
  </Button>
</div>

                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </TabsContent>

          {/* MESSAGES */}
          <TabsContent value="messages">
            {messages.map((m) => (
              <Card key={m.id} className="mb-5">
                <CardHeader>
                  <CardTitle>👤 {m.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>📧 {m.email}</p>
                  {m.phone && <p>📞 {m.phone}</p>}
                  {m.subject && <p>📝 {m.subject}</p>}
                  <p className="text-muted-foreground">{m.message}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
