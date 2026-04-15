import { notFound } from "next/navigation";
import { EBill } from "@/components/Ebill";

const invoices = {
  "A-892": {
    orderNumber: "ORD-2026-001",
    orderType: "Online Tuition",
    amount: 2500,
    date: new Date(),

    customerName: "Rahul Sharma",
    phone: "9876543210",

    items: [
      {
        name: "Mathematics (Class 10)",
        qty: 1,
        rate: 2500,
        price: 2500,
      },
    ],

    subtotal: 2500,
    totalQty: 1,
    sgst: 0,
    cgst: 0,
    roundOff: 0,
    total: 2500,

    // ✅ NEW FIELDS
    postId: "POST-8891",
    enquiryId: "ENQ-5566", // or undefined if not present
    invoiceId: "INV-2026-0001",
    tutorId: "TUT-102",
    tutorName: "Amit Das",
  },
};

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function InvoicePage({ params }: Props) {
  const { id } = await params; // ✅ FIX

  const invoice = invoices[id as keyof typeof invoices];

  console.log(id);

  if (!invoice) return notFound();

  return (
    <div className="mb-20">
      <EBill {...invoice} />
    </div>
  );
}
