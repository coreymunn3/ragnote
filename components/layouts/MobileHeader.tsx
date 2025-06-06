import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { BrainIcon } from "lucide-react";
import { ThemeSwitch } from "../ThemeSwitch";

const MobileHeader = () => {
  return (
    <Navbar>
      <NavbarBrand>
        <BrainIcon className="h-6 w-6" />
        <span className="ml-2 font-bold">RagNote AI</span>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
export default MobileHeader;
