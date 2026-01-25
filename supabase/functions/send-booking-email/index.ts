/// <reference lib="deno.ns" />
/// <reference lib="dom" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import nodemailer from "npm:nodemailer";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
const {
  booking_id, 
  email,
  name,
  phone,              // ✅ ADD THIS LINE
  pickup_location,
  drop_location,
  pickup_date,
  pickup_time,
  status,
} = await req.json();

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD");
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    if (!gmailUser || !gmailPass || !adminEmail) {
      throw new Error("Missing email secrets");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // 📧 Customer email
  await transporter.sendMail({
  from: `"Chandu Travels" <${gmailUser}>`,
  to: email,
  subject: "🚖 Cab Booking Confirmation",
  html: `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:20px;">
          <table width="600" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:#0f172a; color:#ffffff; padding:20px; text-align:center;">
                <h1 style="margin:0;">🚖 Chandu Travels</h1>
                <p style="margin:6px 0 0;">Booking Confirmation</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:24px;">
                <p>Hello <b>${name}</b>,</p>

                <p>Your booking has been <b style="color:#16a34a;">${status}</b>.</p>

                <p><b>Booking ID:</b> ${booking_id}</p>

                <table width="100%" cellpadding="8" cellspacing="0" style="margin:16px 0; border-collapse:collapse;">
                  <tr style="background:#f1f5f9;">
                    <td><b>Pickup</b></td>
                    <td>${pickup_location}</td>
                  </tr>
                  <tr>
                    <td><b>Drop</b></td>
                    <td>${drop_location}</td>
                  </tr>
                  <tr style="background:#f1f5f9;">
                    <td><b>Date</b></td>
                    <td>${pickup_date}</td>
                  </tr>
                  <tr>
                    <td><b>Time</b></td>
                    <td>${pickup_time}</td>
                  </tr>
                </table>

                <!-- Track Button -->
                <div style="text-align:center; margin:24px 0;">
                  <a href="https://your-domain.com/track/${booking_id}"
                     style="background:#2563eb; color:#ffffff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
                    🔍 Track Your Booking
                  </a>
                </div>

                <p style="font-size:14px; color:#6b7280;">
                  Our driver will contact you before pickup.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc; padding:12px; text-align:center; font-size:12px; color:#6b7280;">
                © ${new Date().getFullYear()} Chandu Travels
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
});

    // 📧 Admin email
    // 📧 Admin email
await transporter.sendMail({
  from: `"Chandu Travels" <${gmailUser}>`,
  to: adminEmail,
  subject: "📢 New Booking Received",
  html: `
<!DOCTYPE html>
<html>
  <body style="font-family:Arial, sans-serif; background:#f4f6f8; padding:20px;">
    <div style="max-width:600px; background:#ffffff; padding:20px; border-radius:8px;">
      <h2>🚖 New Booking</h2>
      <p><b>Booking ID:</b> ${booking_id}</p>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> <a href="tel:${phone}">${phone}</a></p>
      <p><b>Route:</b> ${pickup_location} → ${drop_location}</p>
      <p><b>Date & Time:</b> ${pickup_date} ${pickup_time}</p>
      <p><b>Status:</b> ${status}</p>

      <p style="margin-top:20px;">
        <a href="https://your-domain.com/track/${booking_id}">
          View Booking
        </a>
      </p>
    </div>
  </body>
</html>
`,
});


    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Email error:", err);
    return new Response(
      JSON.stringify({ error: "Email failed" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
