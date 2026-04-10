import BackButton from "@/components/BackButton";
import EnquiryForm from "@/components/enquiry/EnquiryForm";

export default function EnquiryPage() {
  return (
    <>
      <BackButton title="Enquiry" />
      <div className="flex flex-col items-center justify-center mt-10 w-full">
        <EnquiryForm />
      </div>
    </>
  );
}
