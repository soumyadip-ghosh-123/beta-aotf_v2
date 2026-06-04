import FloatingButton from "@/components/FloatingButton";
import AdPlacementSlot from "@/components/AdPlacementSlot";
import BottomNav from "@/components/reactbits/bottomNav";
import { Navbar } from "@/components/navbar";

type SiteShellProps = {
  children: React.ReactNode;
  showChrome: boolean;
};

export function SiteShell({ children, showChrome }: SiteShellProps) {
  if (!showChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <BottomNav />
      <div className="relative flex flex-col flex-1">
        <FloatingButton />
        <Navbar />
        <AdPlacementSlot placement="popup" />
        <main className="container mx-auto grow px-2">{children}</main>
      </div>
    </>
  );
}