'use client'

import { LoginForm } from "@/components/Auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="container flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <LoginForm />
    </div>
  )
}
