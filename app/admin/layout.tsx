import AdminFab from "@/components/admin/ui/AdminFab";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AdminFab />
    </>
  );
}
