import { listPublicAds } from "@/lib/services/ad.service";
import InlineAdCard from "@/components/InlineAdCard";
import PopupAdModal from "@/components/PopupAdModal";

type SupportedPlacement = "home_banner" | "popup" | "footer";

type InlineAd = {
  adId: string;
  title: string;
  adType: "image" | "text" | "html";
  placement: string;
  imageUrl?: string;
  content?: string;
  targetUrl?: string;
  advertiser: string;
};

function toInlineAd(ad: unknown): InlineAd {
  return JSON.parse(JSON.stringify(ad)) as InlineAd;
}

export default async function AdPlacementSlot({
  placement,
  className,
}: {
  placement: SupportedPlacement;
  className?: string;
}) {
  const [ad] = await listPublicAds({ placement, limit: 1 });
  if (!ad) {
    return null;
  }

  const plainAd = toInlineAd(ad);

  if (placement === "popup") {
    return <PopupAdModal ad={plainAd} />;
  }

  const wrapperClassName =
    className ??
    (placement === "footer"
      ? "w-full max-w-5xl mx-auto my-8"
      : "w-full max-w-5xl mx-auto my-6");

  return (
    <div className={wrapperClassName}>
      <InlineAdCard ad={plainAd} />
    </div>
  );
}