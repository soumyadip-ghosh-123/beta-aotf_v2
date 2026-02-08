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
import { SlidersHorizontal } from "lucide-react";
import { useFilterSidebar } from "./filter-sidebar-context";

const Search = () => {
  // show or hide scrollable chips based on screen size
  const isShowChip = false; // You can replace this with actual logic based on screen size
  const { open } = useFilterSidebar();
  return (
    <div className="max-w-md w-full flex flex-col justify-center sticky top-17 z-10 mx-auto my-4 p-2 r backdrop-blur-xs">
      <div className="flex w-full max-w-2xl items-center gap-2">
        <Button isIconOnly aria-label="Like" color="primary" onPress={open}>
          <SlidersHorizontal className="text-xl" />
        </Button>
        <Input
          type="text"
          placeholder="Search..."
          startContent={
            <IoMdSearch className="text-xl text-default-400 pointer-events-none" />
          }
          className="flex-1"
        />
        <Button isIconOnly aria-label="Like" color="primary">
          <IoMdSearch className="text-xl" />
        </Button>
      </div>

      {/* <div className="grid grid-cols-4 w-full max-w-2xl items-center gap-2 mt-2">
        <Dropdown>
          <DropdownTrigger>
            <Button size="sm" variant="bordered">
              Class <FaAngleDown className="inline" />
            </Button>
          </DropdownTrigger>

          <DropdownMenu aria-label="Search Filters">
            <DropdownItem key="all">All</DropdownItem>
            <DropdownItem key="files">Files</DropdownItem>
            <DropdownItem key="links">Links</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button size="sm" variant="bordered">
              Board <FaAngleDown className="inline" />
            </Button>
          </DropdownTrigger>

          <DropdownMenu aria-label="Search Filters">
            <DropdownItem key="all">All</DropdownItem>
            <DropdownItem key="files">Files</DropdownItem>
            <DropdownItem key="links">Links</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button size="sm" variant="bordered">
              Subject <FaAngleDown className="inline" />
            </Button>
          </DropdownTrigger>

          <DropdownMenu aria-label="Search Filters">
            <DropdownItem key="all">All</DropdownItem>
            <DropdownItem key="files">Bengali</DropdownItem>
            <DropdownItem key="links">English</DropdownItem>
            <DropdownItem key="links">Math</DropdownItem>
            <DropdownItem key="links">Science</DropdownItem>
            <DropdownItem key="links">History</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button size="sm" variant="bordered">
              Type <FaAngleDown className="inline" />
            </Button>
          </DropdownTrigger>

          <DropdownMenu aria-label="Search Filters">
            <DropdownItem key="all">All</DropdownItem>
            <DropdownItem key="files">Files</DropdownItem>
            <DropdownItem key="links">Links</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div> */}

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
