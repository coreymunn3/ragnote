"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";

export interface Option {
  label: string;
  icon?: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface OptionsMenuProps {
  options: Option[];
}

const OptionsMenu = ({ options }: OptionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={`ghost`} className="">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.label}
            onClick={(e) => {
              option.onClick(e);
            }}
          >
            <div className="flex items-center space-x-2">
              {option.icon}
              <span>{option.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default OptionsMenu;
