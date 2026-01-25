import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("SUPABASE URL FROM APP:", import.meta.env.VITE_SUPABASE_URL);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 🔍 Validate form
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      // 🔐 Login
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      const userId = authData?.user?.id;
      console.log("AUTH USER ID:", userId);
      console.log("AUTH USER EMAIL:", authData?.user?.email);

      if (!userId) {
        toast({
          title: "Access Denied",
          description: "No user id from auth",
          variant: "destructive",
        });
        return;
      }

      // 🔍 READ PROFILE DIRECTLY (NO TYPING, NO RLS ASSUMPTIONS)
      const { data: profile, error: profileError } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      console.log("PROFILE FROM DB:", profile);
      console.log("PROFILE ERROR:", profileError);

      if (!profile) {
        toast({
          title: "Access Denied",
          description: "Profile row not found",
          variant: "destructive",
        });
        return;
      }

      if (profile.role !== "admin") {
        toast({
          title: "Access Denied",
          description: `Role is '${profile.role}', not admin`,
          variant: "destructive",
        });
        return;
      }

      // ✅ SUCCESS
      toast({
        title: "Success",
        description: "Logged in as admin",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
