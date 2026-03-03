"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Input } from "@heroui/input";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { FaUserAlt } from "react-icons/fa";
import { RiDashboardHorizontalFill } from "react-icons/ri";
import { RiLogoutBoxRLine } from "react-icons/ri";
import Image from "next/image";
import { MdFeedback } from "react-icons/md";
export const Navbar = () => {
  const isLoggedIn = true;
  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none shrink-0" />
      }
      type="search"
    />
  );
  const router = useRouter();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="z-50 h-fit top-0">
      <NavbarContent className="h-fit" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Image src="/AOTF.svg" alt="Logo" width={50} height={50} />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="flex h-fit" justify="end">
        {/* <NavbarItem className="flex gap-2"> */}
        <ThemeSwitch />
        {/* </NavbarItem> */}
      </NavbarContent>

      {isLoggedIn ? (
        <NavbarContent justify="center" className=" h-fit">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                size="sm"
                as="button"
                className="transition-transform"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="email" className="gap-2">
                <p className="font-semibold">zoey@example.com</p>
              </DropdownItem>

              <DropdownItem
                key="profile"
                onPress={() => router.push("/u/zoey")}
              >
                <div className="flex items-center gap-2">
                  <FaUserAlt className="text-default-500" />
                  <p className="font-semibold">Profile</p>
                </div>
              </DropdownItem>
              <DropdownItem
                key="dashboard"
                onPress={() => router.push("/u/zoey/dashboard")}
              >
                <div className="flex items-center gap-2">
                  <RiDashboardHorizontalFill className="text-default-500" />
                  <p className="font-semibold">Dashboard</p>
                </div>
              </DropdownItem>
              <DropdownItem
                key="feedback"
                onPress={() => router.push("/u/zoey/feedback")}
              >
                <div className="flex items-center gap-2">
                  <MdFeedback className="text-default-500" />
                  <p className="font-semibold">Feedback</p>
                </div>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                className="text-danger bg-danger/10 hover:bg-danger/20"
                onPress={() => {
                  router.push("/login");
                }}
              >
                <div className="flex items-center gap-2">
                  <RiLogoutBoxRLine className="text-danger" />
                  <p className="font-semibold">Log Out</p>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      ) : (
        <NavbarContent justify="center" className="gap-4 h-fit">
          <Button
            variant="shadow"
            color="primary"
            className="bg-linear-to-r from-indigo-600 to-[#8A7DFF] active:scale-95"
            onPress={() => router.push("/login")}
          >
            Log In
          </Button>
        </NavbarContent>
      )}
    </HeroUINavbar>
  );
};
