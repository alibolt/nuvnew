import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full min-w-0 rounded-md border border-[var(--nuvi-border)] bg-[var(--nuvi-surface)] px-3 py-1.5 text-xs font-medium text-[var(--nuvi-text-primary)] placeholder:text-[var(--nuvi-text-secondary)] transition-all outline-none",
        "focus:border-[var(--nuvi-primary)] focus:ring-1 focus:ring-[var(--nuvi-primary)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-[var(--nuvi-text-primary)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
