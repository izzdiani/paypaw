import { Suspense } from "react";
import { BillsPage } from "@/components/bills-page";

export default function Bills() {
  return (
    <Suspense fallback={null}>
      <BillsPage />
    </Suspense>
  );
}
