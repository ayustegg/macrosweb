"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ToastDemo() {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() =>
          toast.success("Test successful!", {
            description: "This is a test toast",
          })
        }
      >
        Success Toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Test error!", { description: "Something went wrong" })
        }
      >
        Error Toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Test info", { description: "Information message" })
        }
      >
        Info Toast
      </Button>
    </div>
  );
}
