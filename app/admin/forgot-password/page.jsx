"use client";

import { Suspense } from "react";
import { ForgotPasswordContent } from "@/app/(auth)/forgot-password/page";

export default function AdminForgotPasswordPage() {
  return <Suspense fallback={null}><ForgotPasswordContent isAdmin /></Suspense>;
}
