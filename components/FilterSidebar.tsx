import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { X } from "lucide-react";
import { Slider } from "@heroui/slider";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
export default function FilterSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSubjects = useMemo(() => {
    const raw = searchParams.get("subjects");
    if (!raw) return new Set<string>(["all"]);
    const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
    return values.length ? new Set(values) : new Set<string>(["all"]);
  }, [searchParams]);

  const initialBoards = useMemo(() => {
    const raw = searchParams.get("boards");
    if (!raw) return new Set<string>(["all"]);
    const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
    return values.length ? new Set(values) : new Set<string>(["all"]);
  }, [searchParams]);

  const initialClassType = useMemo(
    () => searchParams.get("classType") ?? "both",
    [searchParams],
  );

  const initialBudget = useMemo(() => {
    const min = Number(searchParams.get("minBudget") ?? "500");
    const max = Number(searchParams.get("maxBudget") ?? "5000");
    return [Number.isNaN(min) ? 500 : min, Number.isNaN(max) ? 5000 : max];
  }, [searchParams]);

  const [subjectKeys, setSubjectKeys] = useState<Set<string>>(initialSubjects);
  const [boardKeys, setBoardKeys] = useState<Set<string>>(initialBoards);
  const [classType, setClassType] = useState(initialClassType);
  const [budgetRange, setBudgetRange] = useState<number[]>(initialBudget);

  useEffect(() => {
    setSubjectKeys(initialSubjects);
    setBoardKeys(initialBoards);
    setClassType(initialClassType);
    setBudgetRange(initialBudget);
  }, [initialSubjects, initialBoards, initialClassType, initialBudget]);

  const normalizeMultiSelect = (keys: "all" | Set<string>): Set<string> => {
    if (keys === "all") return new Set(["all"]);
    if (keys.has("all") || keys.size === 0) return new Set(["all"]);
    return new Set(keys);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    const subjects = Array.from(subjectKeys).filter((k) => k !== "all");
    if (subjects.length > 0) params.set("subjects", subjects.join(","));
    else params.delete("subjects");

    const boards = Array.from(boardKeys).filter((k) => k !== "all");
    if (boards.length > 0) params.set("boards", boards.join(","));
    else params.delete("boards");

    if (classType && classType !== "both") {
      params.set("classType", classType);
    } else {
      params.delete("classType");
    }

    const [minBudget, maxBudget] = budgetRange;
    params.set("minBudget", String(minBudget));
    params.set("maxBudget", String(maxBudget));

    const next = params.toString();
    router.push(next ? `/posts?${next}` : "/posts");
    onClose();
  };

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("subjects");
    params.delete("boards");
    params.delete("classType");
    params.delete("minBudget");
    params.delete("maxBudget");
    params.delete("page");

    setSubjectKeys(new Set(["all"]));
    setBoardKeys(new Set(["all"]));
    setClassType("both");
    setBudgetRange([500, 5000]);

    const next = params.toString();
    router.push(next ? `/posts?${next}` : "/posts");
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-background z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button isIconOnly variant="light" onPress={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4">
          {/* <Select label="Class">
            {[6, 7, 8, 9, 10, 11, 12].map((c) => (
              <SelectItem key={c}>Class {c}</SelectItem>
            ))}
          </Select> */}

          <Select
            label="Subject"
            selectionMode="multiple"
            selectedKeys={subjectKeys}
            onSelectionChange={(keys) =>
              setSubjectKeys(normalizeMultiSelect(keys as "all" | Set<string>))
            }
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="math">Math</SelectItem>
            <SelectItem key="science">Science</SelectItem>
            <SelectItem key="english">English</SelectItem>
          </Select>

          <Select
            label="Board"
            selectionMode="multiple"
            selectedKeys={boardKeys}
            onSelectionChange={(keys) =>
              setBoardKeys(normalizeMultiSelect(keys as "all" | Set<string>))
            }
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="cbse">CBSE</SelectItem>
            <SelectItem key="icse">ICSE</SelectItem>
          </Select>

          <Select
            label="Class Type"
            selectedKeys={[classType]}
            onSelectionChange={(keys) => {
              const [next] = Array.from(keys as Set<string>);
              setClassType(next ?? "both");
            }}
          >
            <SelectItem key="offline">In-Person</SelectItem>
            <SelectItem key="online">Online</SelectItem>
            <SelectItem key="both">Both</SelectItem>
          </Select>

          <Slider
            showTooltip
            className="max-w-md"
            value={budgetRange}
            onChange={(value) => setBudgetRange(value as number[])}
            formatOptions={{ style: "currency", currency: "INR" }}
            label="Price Range"
            maxValue={5000}
            minValue={500}
            showSteps={true}
            step={500}
          />
          <div className="flex gap-3">
            <Button variant="bordered" className="w-full" onPress={resetFilters}>
              Reset
            </Button>
            <Button color="primary" className="w-full" onPress={applyFilters}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
