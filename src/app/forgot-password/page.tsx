import { Suspense } from "react";
import Header from "@/components/Header";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <ForgotPasswordClient />
      </Suspense>
    </>
  );
}