import { Suspense } from "react";
import Header from "@/components/Header";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <ResetPasswordClient />
      </Suspense>
    </>
  );
}