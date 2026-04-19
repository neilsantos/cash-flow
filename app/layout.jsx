import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata = {
  title: "Admin Financeiro",
  description: "Gestao de fluxo de caixa e clientes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-[#f6f7f4] text-zinc-950">
          <Sidebar />
          <main className="min-h-screen lg:pl-72">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
