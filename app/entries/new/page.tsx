"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EntryForm from "@/app/components/EntryForm";
import { Target } from "lucide-react";

export default function NewEntryPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 md:space-y-8">
      {/* Page header */}
      <div className="relative">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <Target className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl tracking-wider text-secondary">
            MY ENTRY
          </h1>
        </div>
        <div className="h-0.5 w-24 bg-primary"></div>
        <p className="mt-3 text-muted-foreground">
          Lock in your tournament predictions
        </p>
      </div>

      <EntryForm />
    </div>
  );
}
