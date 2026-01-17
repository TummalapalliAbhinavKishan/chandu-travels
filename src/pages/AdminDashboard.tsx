import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Calendar, MessageSquare, Phone, Mail, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  special_requests: string | null;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, messagesRes] = await Promise.all([
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (messagesRes.error) throw messagesRes.error;

      setBookings(bookingsRes.data || []);
      setMessages(messagesRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;

      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast({
        title: "Success",
        description: "Booking status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
      if (error) throw error;

      setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
      toast({
        title: "Success",
        description: "Message status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
      in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
      new: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      read: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-500";
  };

  const copyTrackingLink = (orderNumber: string) => {
    const trackingUrl = `${window.location.origin}/track/${orderNumber}`;
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: "Copied!",
      description: "Tracking link copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/admin/update-location")} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Update Location
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => b.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">New Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {messages.filter(m => m.status === "new").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{booking.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Order: <span className="font-mono font-semibold">{booking.order_number}</span>
                      </p>
                    </div>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => updateBookingStatus(booking.id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="break-all">{booking.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{booking.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="break-words">
                          <strong>From:</strong> {booking.pickup_location}
                        </div>
                        <div className="break-words">
                          <strong>To:</strong> {booking.drop_location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{new Date(booking.pickup_date).toLocaleDateString()} at {booking.pickup_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{booking.passengers} passenger(s)</span>
                    </div>
                    {booking.special_requests && (
                      <div className="pt-2 border-t">
                        <strong className="text-sm">Special Requests:</strong>
                        <p className="text-muted-foreground mt-1 break-words">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <span>•</span>
                      <span>Created: {new Date(booking.created_at).toLocaleString()}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTrackingLink(booking.order_number)}
                    >
                      <MapPin className="h-3 w-3 mr-2" />
                      Copy Tracking Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No bookings yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg">{message.name}</CardTitle>
                    <Select
                      value={message.status}
                      onValueChange={(value) => updateMessageStatus(message.id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="break-all">{message.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{message.phone}</span>
                    </div>
                    {message.subject && (
                      <div>
                        <strong>Subject:</strong> {message.subject}
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <strong className="text-sm">Message:</strong>
                      <p className="text-muted-foreground mt-1 break-words">{message.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className={getStatusColor(message.status)}>
                      {message.status}
                    </Badge>
                    <span>•</span>
                    <span>Created: {new Date(message.created_at).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No messages yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
