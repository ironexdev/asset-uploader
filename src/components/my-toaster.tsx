"use client";

import { Toaster } from "sonner";

const MyToaster = () => {
  return (
    <>
      <Toaster
        duration={6000}
        gap={10}
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "gap-[10px] rounded-md border-[1px] border-toast",
            title: "w-full text-sm",
            description: "text-base w-full",
            icon: "hidden",
            default: "bg-toast text-toast",
            error: "bg-toast-error text-toast-error",
            info: "bg-toast-info text-toast-info",
            loading: "bg-toast-loading text-toast-loading",
            success: "bg-toast-success text-toast-success",
            warning: "bg-toast-warning text-toast-warning",
          },
        }}
      />
    </>
  );
};

export default MyToaster;
