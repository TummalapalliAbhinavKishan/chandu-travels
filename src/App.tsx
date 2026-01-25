import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import VideoIntro from "./pages/VideoIntro";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UpdateLocation from "./pages/UpdateLocation";
import TrackBooking from "./pages/TrackBooking";

import ProtectedRoute from "./components/ProtectedRoute";
import RentalBooking from "./pages/RentalBooking";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<VideoIntro />} />
            <Route path="/home" element={<Home />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/track/:orderNumber" element={<TrackBooking />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/update-location"
              element={
                <ProtectedRoute>
                  <UpdateLocation />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />

            <Route path="/rental" element={<RentalBooking />} />
          </Routes>

        


        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
