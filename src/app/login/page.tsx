import { Suspense } from "react";
import Header from "@/components/Header";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
        <LoginClient />
      </Suspense>
    </>
  );
}