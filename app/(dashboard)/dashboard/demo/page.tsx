import { requireAuth } from "@/domains/core/auth/require-auth";

const DemoPage = async () => {
  // Protege a rota - redireciona se não autenticado
  await requireAuth();
  
  return <>
    <h1>Demo private page</h1>
  </>;
}

export default DemoPage;