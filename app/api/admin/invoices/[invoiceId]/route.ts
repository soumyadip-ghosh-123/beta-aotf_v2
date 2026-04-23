import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Invoice from "@/lib/models/Invoice";

// ─── GET /api/admin/invoices/[invoiceId] ──────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    await dbConnect();
    const { invoiceId } = await params;

    const invoice = await Invoice.findOne({ invoiceId }).lean();
    if (!invoice) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("[GET /api/admin/invoices/[invoiceId]]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── PUT /api/admin/invoices/[invoiceId] ──────────────────────────────────────
// Updates payment status / partial payment info on an existing invoice.
// For full invoice revisions, a new document (with incremented version) is
// created and the previous one's isLatest is set to false.

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    await dbConnect();
    const { invoiceId } = await params;
    const body = await request.json();

    const existing = await Invoice.findOne({ invoiceId });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 },
      );
    }

    const {
      paymentStatus,
      paymentDate,
      partialAmountPaid,
      partialPercentagePaid,
      // Full revision fields
      revisionReason,
      // Allow updating notes, items etc. (treated as a revision)
      notes,
      dueDate,
    } = body;

    // ── Partial payment calculation ─────────────────────────────────────────
    let partialPayment = existing.partialPayment;
    if (paymentStatus === "partial") {
      const total = existing.amount.grandTotal;
      let amountPaid = 0;
      let pctPaid = 0;

      if (partialAmountPaid !== undefined && partialAmountPaid !== null) {
        amountPaid = Number(partialAmountPaid);
        pctPaid = total > 0 ? Math.min(100, (amountPaid / total) * 100) : 0;
      } else if (
        partialPercentagePaid !== undefined &&
        partialPercentagePaid !== null
      ) {
        pctPaid = Math.min(100, Number(partialPercentagePaid));
        amountPaid = (pctPaid / 100) * total;
      } else if (existing.partialPayment) {
        // Keep existing partial data if no new values provided
        partialPayment = existing.partialPayment;
      }

      if (partialAmountPaid !== undefined || partialPercentagePaid !== undefined) {
        partialPayment = {
          amountPaid: Math.round(amountPaid * 100) / 100,
          percentagePaid: Math.round(pctPaid * 100) / 100,
          amountDue:
            Math.round((existing.amount.grandTotal - amountPaid) * 100) / 100,
        };
      }
    } else {
      // If status changed away from partial, clear partial data
      if (
        paymentStatus === "paid" ||
        paymentStatus === "unpaid"
      ) {
        partialPayment = undefined;
      }
    }

    // Apply updates
    if (paymentStatus) existing.paymentStatus = paymentStatus;
    if (paymentDate !== undefined)
      existing.paymentDate = paymentDate ? new Date(paymentDate) : undefined;
    if (partialPayment !== undefined) existing.partialPayment = partialPayment;
    if (notes !== undefined) existing.breakdown.notes = notes;
    if (dueDate !== undefined)
      existing.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (revisionReason) existing.revisionReason = revisionReason;

    await existing.save();

    return NextResponse.json({ success: true, invoice: existing });
  } catch (error) {
    console.error("[PUT /api/admin/invoices/[invoiceId]]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// ─── DELETE /api/admin/invoices/[invoiceId] ───────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  try {
    await dbConnect();
    const { invoiceId } = await params;

    const result = await Invoice.deleteOne({ invoiceId });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Invoice not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    console.error("[DELETE /api/admin/invoices/[invoiceId]]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
