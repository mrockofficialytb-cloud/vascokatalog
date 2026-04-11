import { Suspense } from "react";
import Header from "@/components/Header";
import RegisterClient from "./RegisterClient";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <RegisterClient />
      </Suspense>
    </>
  );
}