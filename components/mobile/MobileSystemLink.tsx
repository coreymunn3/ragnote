"use client";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { TypographyP } from "../ui/typography";

interface MobileSystemLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isLastItem?: boolean;
}

const MobileSystemLink = ({
  href,
  icon: Icon,
  label,
  isLastItem = false,
}: MobileSystemLinkProps) => {
  return (
    <div>
      <Link
        href={href}
        className="w-full px-4 h-14 flex items-center space-x-2 hover:bg-accent/50 transition-colors"
      >
        <Icon className="h-5 w-5 text-muted-foreground" />
        <TypographyP className="truncate">{label}</TypographyP>
      </Link>
      {isLastItem && <hr className="border-sidebar-border"></hr>}
    </div>
  );
};

export default MobileSystemLink;
