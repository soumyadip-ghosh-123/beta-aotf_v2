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

const Search = () => {
  return (
    <div className="w-full flex flex-col justify-center">
      <div className="flex w-full max-w-2xl items-center gap-2">
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
      <div className="grid grid-cols-3 w-full max-w-2xl items-center gap-2 mt-2">
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">
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
            <Button variant="bordered">
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
            <Button variant="bordered">
              Type <FaAngleDown className="inline" />
            </Button>
          </DropdownTrigger>

          <DropdownMenu aria-label="Search Filters">
            <DropdownItem key="all">All</DropdownItem>
            <DropdownItem key="files">Files</DropdownItem>
            <DropdownItem key="links">Links</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default Search;
