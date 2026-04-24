"use client";

import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { IoMdSearch } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import { Filter } from "lucide-react";
import { useFilterSidebar } from "./filter-sidebar-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const suggestions = ["Subject", "Board", "Class Type", "Budget","Location","Frequency"];
const TYPE_SPEED_MS = 90;
const ERASE_SPEED_MS = 45;
const HOLD_MS = 900;

const Search = () => {
  // show or hide scrollable chips based on screen size
  const isShowChip = false; // You can replace this with actual logic based on screen size
  const { open } = useFilterSidebar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = useMemo(
    () => searchParams.get("search") ?? "",
    [searchParams]
  );
  const [query, setQuery] = useState(initialSearch);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    setQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const current = suggestions[suggestionIndex] ?? "";

    if (!isErasing && typed.length < current.length) {
      const id = window.setTimeout(() => {
        setTyped(current.slice(0, typed.length + 1));
      }, TYPE_SPEED_MS);
      return () => window.clearTimeout(id);
    }

    if (!isErasing && typed.length === current.length) {
      const id = window.setTimeout(() => setIsErasing(true), HOLD_MS);
      return () => window.clearTimeout(id);
    }

    if (isErasing && typed.length > 0) {
      const id = window.setTimeout(() => {
        setTyped(current.slice(0, typed.length - 1));
      }, ERASE_SPEED_MS);
      return () => window.clearTimeout(id);
    }

    if (isErasing && typed.length === 0) {
      setIsErasing(false);
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }
  }, [typed, isErasing, suggestionIndex]);

  const applySearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      params.set("search", trimmed);
      params.set("page", "1");
    } else {
      params.delete("search");
      params.delete("page");
    }

    const next = params.toString();
    router.push(next ? `/posts?${next}` : "/posts");
  };
  return (
    <div className="max-w-md w-full flex flex-col justify-center sticky top-17 z-10 mx-auto p-1 r backdrop-blur-xs">
      <form
        className="flex w-full max-w-2xl items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          applySearch(query);
        }}
      >
        {/* <Button isIconOnly aria-label="Like"  onPress={open} variant="bordered" >
          <Filter size={20}/>
        </Button> */}
        <Input
          type="text"
          placeholder={`Search ${typed || suggestions[suggestionIndex]}...`}
          startContent={
            <IoMdSearch className="text-xl text-default-400 pointer-events-none" />
          }
          className="flex-1"
          value={query}
          onValueChange={setQuery}
        />
        <Button isIconOnly aria-label="Like" color="primary" type="submit">
          <IoMdSearch className="text-xl" />
        </Button>
      </form>
      {/* show or hide scrollable chips based on screen size with props */}

      {isShowChip && (
        <ScrollShadow
          className="max-w-full max-h-75 no-scrollbar my-2"
          orientation="horizontal"
        >
          <div className="flex gap-2 ">
            {/* 6 chips */}
            {Array.from({ length: 6 }, (_, i) => (
              <Chip key={i} radius="sm" className="p-4 px-2">
                Chip {i + 1}
              </Chip>
            ))}
          </div>
        </ScrollShadow>
      )}
    </div>
  );
};

export default Search;
