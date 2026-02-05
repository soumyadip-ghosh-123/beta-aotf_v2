import EnquiryCard, { Enquiry } from "@/components/admin/enquiries/EnquiryCard";
import { title } from "@/components/primitives";
import Search from "@/components/Search";

export default function DocsPage() {
  const enquiryData: Enquiry = {
    enquiryId: "E-040226150",
    name: "John Doe",
    phone: "87456 78901", 
    // 5 digit area code followed by 6 digit number, total 10 digits
    query: "I need a math tutor for my daughter in class 8, CBSE.",
    currentStatus: "new",
    lastActionByAdmin: "Soumyadip",
    adminRole: "super admin",
    resolvedAt: "2024-04-26T09:15:30.000Z",
    lastActionAt: "2024-04-26T09:15:30.000Z",
    createdAt: "2024-04-26T09:15:30.000Z",
    updatedAt: "2024-04-26T09:15:30.000Z",
  };
  return (
    <div className="space-y-6 py-4">
      {/* <Search /> */}
      <EnquiryCard enquiry={enquiryData} />

      {/* 
        add student option
        class             board
        class             board
                  +
      
      */}
    </div>
  );
}
