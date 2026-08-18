import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Verify Midtrans webhook signature
function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
  return hash === signatureKey;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      order_id: orderId,
      transaction_status: txStatus,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signatureKey,
    } = body;

    // Validasi signature
    if (!verifySignature(orderId, statusCode, grossAmount, SERVER_KEY, signatureKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Pakai service_role key biar bisa update booking tanpa RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Mapping status Midtrans ke booking status
    let bookingStatus: string | null = null;
    let paymentStatus: string | null = null;

    if (txStatus === "capture" || txStatus === "settlement") {
      bookingStatus = "dikonfirmasi";
      paymentStatus = "dibayar";
    } else if (txStatus === "pending") {
      bookingStatus = "menunggu_konfirmasi";
      paymentStatus = "menunggu";
    } else if (txStatus === "deny" || txStatus === "cancel" || txStatus === "expire") {
      bookingStatus = "dibatalkan";
      paymentStatus = "gagal";
    } else if (txStatus === "refund" || txStatus === "partial_refund") {
      paymentStatus = "refund";
    }

    // Update transaction
    if (paymentStatus) {
      await supabase
        .from("transactions")
        .update({
          status: paymentStatus,
          payment_method: body.payment_type ?? null,
          paid_at: paymentStatus === "dibayar" ? new Date().toISOString() : null,
        })
        .eq("booking_id", orderId);
    }

    // Update booking status
    if (bookingStatus) {
      await supabase
        .from("bookings")
        .update({ status: bookingStatus })
        .eq("id", orderId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Midtrans webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
