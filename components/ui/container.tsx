import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  full?: boolean;
}

export function Container({ className, full, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        full ? "w-full" : "mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  );
}
