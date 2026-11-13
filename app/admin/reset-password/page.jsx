"use client";

import { Suspense } from "react";
import ResetPasswordForm from "@/app/(auth)/reset-password/reset-password-form";

export default function AdminResetPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm isAdmin /></Suspense>;
}
