import Image from "next/image";
import { monthImages } from "./monthImages";

export default function MonthHeader({ label }: { label: string }) {
  const monthName = label.split(" ")[0]; // "February"
  const imageSrc = monthImages[monthName] || "/month_images/default.webp";

  return (
    <>
      {/* <h2 className="text-2xl font-semibold">{label}</h2> */}

      <div className="relative w-full h-40 rounded-xl overflow-hidden mt-3">
        <Image
          src={imageSrc}
          alt={monthName}
          fill
          className="object-cover"
          priority
        />
      </div>
    </>
  );
}
