import { Suspense } from "react";
import LoginClient from "./loginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
