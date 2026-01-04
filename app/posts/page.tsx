import { Input } from "@heroui/input";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import { IoSearch } from "react-icons/io5";
import Search from "@/components/Search";

export default function DocsPage() {
  return (
    <div>
      <Search />
      <ScrollShadow
        className="max-w-100 max-h-75 no-scrollbar my-2"
        orientation="horizontal"
      >
        <div className="flex gap-2 ">
          {/* 6 chips */}
          {Array.from({ length: 6 }, (_, i) => (
            <Chip key={i} radius="sm" className="bg-default-200">
              Chip {i + 1}
            </Chip>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}
