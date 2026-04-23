import { notFound } from "next/navigation";
import { EBill } from "@/components/Ebill";
import dbConnect from "@/lib/db";
import Invoice from "@/lib/models/Invoice";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoicePage({ params }: Props) {
  const { id } = await params;

  await dbConnect();
  const invoiceDoc = await Invoice.findOne({ invoiceId: id }).lean();

  if (!invoiceDoc) return notFound();

  // Map Mongoose document to EBill Props format
  const totalQty = invoiceDoc.breakdown.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const mappedInvoice = {
    orderNumber: invoiceDoc.invoiceId,
    orderType: invoiceDoc.postId ? "Online Tuition" : "Service",
    amount: invoiceDoc.amount.grandTotal,
    date: invoiceDoc.invoiceDate,

    customerName: invoiceDoc.recipient.name,
    phone: invoiceDoc.recipient.phone || "N/A",

    items: invoiceDoc.breakdown.items.map((item: any) => ({
      name: item.name,
      qty: item.quantity,
      rate: item.unitAmount,
      price: item.total,
    })),

    subtotal: invoiceDoc.amount.subTotal,
    totalQty,
    sgst: 0,
    cgst: 0,
    roundOff: 0,
    total: invoiceDoc.amount.grandTotal,

    postId: invoiceDoc.postId || "N/A",
    enquiryId: undefined,
    invoiceId: invoiceDoc.invoiceId,
    tutorId: "N/A", // Not currently stored directly on the invoice
    tutorName: invoiceDoc.assignedTeacher?.name || "N/A",
  };

  return (
    <div className="mb-20">
      <EBill {...mappedInvoice} />
    </div>
  );
}
