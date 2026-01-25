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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      rental_id,
      name,
      email,
      phone,
      pickup_location,
      car_type,
      start_date,
      end_date,
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
      subject: "🚗 Rental Booking Confirmation",
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
                <h1 style="margin:0;">🚗 Chandu Travels</h1>
                <p style="margin:6px 0 0;">Rental Booking Confirmation</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:24px;">
                <p>Hello <b>${name}</b>,</p>

                <p>Your <b>car rental booking</b> has been <b style="color:#16a34a;">confirmed</b>.</p>

                <table width="100%" cellpadding="8" cellspacing="0" style="margin:16px 0; border-collapse:collapse;">
                  <tr style="background:#f1f5f9;">
                    <td><b>📞 Phone</b></td>
                    <td>${phone}</td>
                  </tr>
                  <tr>
                    <td><b>📍 Pickup Location</b></td>
                    <td>${pickup_location}</td>
                  </tr>
                  <tr style="background:#f1f5f9;">
                    <td><b>🚗 Car Type</b></td>
                    <td>${car_type}</td>
                  </tr>
                  <tr>
                    <td><b>📅 Start Date</b></td>
                    <td>${start_date}</td>
                  </tr>
                  <tr style="background:#f1f5f9;">
                    <td><b>📅 End Date</b></td>
                    <td>${end_date}</td>
                  </tr>
                </table>

                <p style="font-size:14px; color:#6b7280;">
                  Our team will contact you shortly with further details.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc; padding:12px; text-align:center; font-size:12px; color:#6b7280;">
                © ${new Date().getFullYear()} Chandu Travels · Safe & Reliable Journeys
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
    await transporter.sendMail({
      from: `"Chandu Travels" <${gmailUser}>`,
      to: adminEmail,
      subject: "📢 New Rental Booking",
      html: `
<!DOCTYPE html>
<html>
  <body style="font-family:Arial, sans-serif; background:#f4f6f8; padding:20px;">
    <div style="max-width:600px; background:#ffffff; padding:20px; border-radius:8px;">
      <h2>🚗 New Rental Booking</h2>

      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Phone:</b> <a href="tel:${phone}">${phone}</a></p>
      <p><b>Pickup Location:</b> ${pickup_location}</p>
      <p><b>Car Type:</b> ${car_type}</p>
      <p><b>Rental Period:</b> ${start_date} → ${end_date}</p>

      <p style="margin-top:16px; font-size:13px; color:#6b7280;">
        Please follow up with the customer for pricing and availability.
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
    console.error("Rental email error:", err);
    return new Response(
      JSON.stringify({ error: "Rental email failed" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
