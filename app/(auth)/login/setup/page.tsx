"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { setupAdminAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await setupAdminAction(email, password, name);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <ShieldCheck className="h-6 w-6 text-orange-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-wider text-neutral-950">
          Admin Setup
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create the first admin account for MOTOMAN
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="setup-name" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Full Name
            </label>
            <input
              id="setup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition-colors outline-none focus:border-orange-500 focus:ring-orange-500/20"
              placeholder="Admin Name"
            />
          </div>

          <div>
            <label htmlFor="setup-email" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="setup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition-colors outline-none focus:border-orange-500 focus:ring-orange-500/20"
              placeholder="admin@motoman.in"
            />
          </div>

          <div>
            <label htmlFor="setup-password" className="mb-1.5 block text-sm font-medium text-neutral-700">
              Password
            </label>
            <div className="relative">
              <input
                id="setup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 pr-10 text-sm transition-colors outline-none focus:border-orange-500 focus:ring-orange-500/20"
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all",
              "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Create Admin Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Already set up?{" "}
          <a
            href="/login"
            className="font-medium text-orange-500 hover:text-orange-600"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
