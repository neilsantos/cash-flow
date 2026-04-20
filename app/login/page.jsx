import { CircleDollarSign } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const nextPath = typeof params?.next === "string" ? params.next : "/";
  const error = typeof params?.error === "string" ? params.error : "";

  return (
    <div className="grid min-h-[calc(100vh-2.5rem)] place-items-center">
      <section className="w-full max-w-md rounded-lg border border-zinc-200/80 bg-white/90 p-6 shadow-xl shadow-zinc-900/[0.06] backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-emerald-700 text-white">
            <CircleDollarSign size={24} />
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-700">Admin Financeiro</p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Acessar sistema
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-600">
          Entre com seu e-mail e senha ou use sua conta Google autorizada.
        </p>

        <div className="mt-6">
          <LoginForm error={error} nextPath={nextPath} />
        </div>
      </section>
    </div>
  );
}
