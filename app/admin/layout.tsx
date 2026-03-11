import AdminFab from "@/components/admin/ui/AdminFab";
import AdminSidebar from "@/components/admin/ui/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminSidebar />
      {/* Offset content so hamburger button doesn't overlap top-left text */}
      {/* <div className="pl-14 pt-2"> */}
        {children}
      {/* </div> */}
      <AdminFab />
    </>
  );
}
