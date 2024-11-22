'use client'

import { RegisterForm } from "@/components/Auth/RegisterForm"

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  )
}
