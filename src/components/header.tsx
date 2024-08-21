"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import StepNavigation from "@/components/step-navigation";
import { usePathname } from "next/navigation";

export default function Header({ step }: { step?: 1 | 2 }) {
  const pathname = usePathname();
  return (
    <header className="fixed left-0 right-0 top-0 z-10 flex h-[80px] w-full items-center justify-between bg-secondary p-4 shadow-md">
      <div className="container mx-auto flex max-w-container items-center justify-between">
        <h1 className="text-xl font-semibold">
          <Link href="/">Image Manager</Link>
        </h1>
        {step && <StepNavigation step={step} />}
        <menu className="flex justify-between">
          <Link
            className={cn("px-5", {
              "font-bold text-highlightedText": pathname === "/",
            })}
            href="/"
          >
            Home
          </Link>
          &nbsp;|&nbsp;
          <Link
            className={cn("px-5", {
              "font-bold text-highlightedText": pathname === "/s3-server",
            })}
            href="/s3-server"
          >
            S3 Server
          </Link>
          &nbsp;|&nbsp;
          <Link
            className={cn("px-5", {
              "font-bold text-highlightedText": pathname === "/s3-storage",
            })}
            href="/s3-storage"
          >
            S3 Storage
          </Link>
        </menu>
      </div>
    </header>
  );
}
