import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <header className="flex flex-row items-center w-full gap-2 pb-2 mb-2 justify-start">
      <SidebarTrigger />
      {children}
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default PageHeader;