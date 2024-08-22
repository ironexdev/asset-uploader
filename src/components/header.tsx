"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import StepNavigation from "@/components/step-navigation";
import { usePathname } from "next/navigation";

export default function Header({ step }: { step?: 1 | 2 }) {
  const pathname = usePathname();
  return (
    <header className="bg-gradient-header w-xl border-h border-header fixed left-0 right-0 top-0 z-10 flex h-[80px] w-full items-center justify-between border-b-[1px] p-4">
      <div className="container relative mx-auto flex max-w-container items-center justify-between">
        <menu className="flex justify-between text-secondary">
          <Link
            className={cn("px-5 text-secondary", {
              "font-bold text-primary": pathname === "/",
            })}
            href="/"
          >
            Home
          </Link>
          &nbsp;|&nbsp;
          <Link
            className={cn("px-5 text-secondary", {
              "font-bold text-primary": pathname === "/s3-server",
            })}
            href="/s3-server"
          >
            S3 Server
          </Link>
          {/*
            NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME is optional
          */}
          {process.env.NEXT_PUBLIC_AWS_S3_STORAGE_BUCKET_NAME && (
            <>
              &nbsp;|&nbsp;
              <Link
                className={cn("px-5 text-secondary", {
                  "font-bold text-primary": pathname === "/s3-storage",
                })}
                href="/s3-storage"
              >
                S3 Storage
              </Link>
            </>
          )}
        </menu>
        <h1 className="text-shadow absolute left-1/2 -translate-x-1/2 transform text-2xl font-semibold text-white">
          <Link href="/">Image Manager</Link>
        </h1>
        {step && <StepNavigation step={step} />}
      </div>
    </header>
  );
}
