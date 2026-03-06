"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { ThemeSwitch } from "@/components/theme-switch";
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
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const username = user?.username ?? "";

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
        <ThemeSwitch />
      </NavbarContent>

      <SignedIn>
        <NavbarContent justify="center" className="h-fit">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                size="sm"
                as="button"
                className="transition-transform"
                src={user?.imageUrl}
                name={user?.firstName?.[0] ?? ""}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="email" className="gap-2" textValue="email">
                <p className="font-semibold">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </DropdownItem>

              <DropdownItem
                key="profile"
                textValue="Profile"
                onPress={() => router.push(`/u/${username}`)}
              >
                <div className="flex items-center gap-2">
                  <FaUserAlt className="text-default-500" />
                  <p className="font-semibold">Profile</p>
                </div>
              </DropdownItem>
              <DropdownItem
                key="dashboard"
                textValue="Dashboard"
                onPress={() => router.push(`/u/${username}/dashboard`)}
              >
                <div className="flex items-center gap-2">
                  <RiDashboardHorizontalFill className="text-default-500" />
                  <p className="font-semibold">Dashboard</p>
                </div>
              </DropdownItem>
              <DropdownItem
                key="feedback"
                textValue="Feedback"
                onPress={() => router.push(`/u/${username}/feedback`)}
              >
                <div className="flex items-center gap-2">
                  <MdFeedback className="text-default-500" />
                  <p className="font-semibold">Feedback</p>
                </div>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                textValue="Log Out"
                className="text-danger bg-danger/10 hover:bg-danger/20"
                onPress={() => signOut({ redirectUrl: "/" })}
              >
                <div className="flex items-center gap-2">
                  <RiLogoutBoxRLine className="text-danger" />
                  <p className="font-semibold">Log Out</p>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </SignedIn>

      <SignedOut>
        <NavbarContent justify="center" className="gap-4 h-fit">
          <Button
            variant="shadow"
            color="primary"
            className="bg-linear-to-r from-indigo-600 to-[#8A7DFF] active:scale-95"
            onPress={() => router.push("/sign-in")}
          >
            Log In
          </Button>
        </NavbarContent>
      </SignedOut>
    </HeroUINavbar>
  );
};
