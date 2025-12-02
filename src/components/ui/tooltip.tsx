"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({
  className,
  ...props
}: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Content
    className={cn(
      "rounded-md border bg-white px-2 py-1 text-sm shadow-md",
      className
    )}
    {...props}
  />
);
