import { requireAuth } from "@/domains/core/auth/require-auth";
import Link from "next/link";

const DashboardPage = async () => {
  // Protege a rota e obtém o usuário autenticado
  // Se não houver sessão válida, redireciona para /login
  const user = await requireAuth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/logout"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
        >
          Logout
        </Link>
      </div>
      <p>You are in a private route, {user.name}!</p>
    </div>
  );
}

export default DashboardPage;