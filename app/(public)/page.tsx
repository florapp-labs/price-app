import { getUser } from "@/domains/users/repositories/user.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { 
  Calculator, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  BarChart3, 
  Shield,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { 
  SignupForm,
  SignupFormLayout,
  SignupFormBenefits,
  SignupFormContainer,
  SignupFormHeader,
  SignupFormForm,
  SignupFormFields,
  SignupFormMessages,
  SignupFormActions,
  SignupFormFooter,
  SignupFormMobileBenefits
} from "@/components/auth/SignupForm";

const Page = async () => {
  const user = await getUser();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/20 py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Precificação Inteligente
              <span className="block text-primary">Automatizada para Lojistas</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Calcule automaticamente o preço de venda dos seus produtos compostos. 
              Controle insumos, impostos, margem de lucro e receba alertas quando precisar reajustar preços.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {user ? (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/dashboard">
                    Ir para Dashboard
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/signup">
                      Começar Gratuitamente
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/login">Fazer Login</Link>
                  </Button>
                </>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              100% Gratuito • Sem cartão de crédito • Sem pegadinhas
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo que você precisa para precificar com confiança
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Automatize cálculos complexos e tome decisões baseadas em dados reais
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calculator className="size-6 text-primary" />
                </div>
                <CardTitle>Cálculo Automático</CardTitle>
                <CardDescription>
                  Preços calculados automaticamente com base em insumos, impostos e margem de lucro desejada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <AlertCircle className="size-6 text-primary" />
                </div>
                <CardTitle>Alertas de Reajuste</CardTitle>
                <CardDescription>
                  Receba notificações quando insumos mudarem de preço e seus produtos precisarem de reajuste
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="size-6 text-primary" />
                </div>
                <CardTitle>Controle de Margem</CardTitle>
                <CardDescription>
                  Defina margens de lucro personalizadas e veja o impacto em tempo real nos seus preços
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="size-6 text-primary" />
                </div>
                <CardTitle>Produtos Compostos</CardTitle>
                <CardDescription>
                  Gerencie kits, boxes, cestas e arranjos com múltiplos insumos de forma simples
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="size-6 text-primary" />
                </div>
                <CardTitle>Dashboard Analítico</CardTitle>
                <CardDescription>
                  Visualize seus produtos, custos e margens em um dashboard intuitivo e poderoso
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="size-6 text-primary" />
                </div>
                <CardTitle>Simples e Seguro</CardTitle>
                <CardDescription>
                  Seus dados protegidos e sincronizados na nuvem, acessíveis de qualquer lugar
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Como funciona
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Em 3 passos simples, você terá seus preços calculados automaticamente
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Cadastre seus Insumos</h3>
              <p className="text-muted-foreground">
                Adicione os materiais que você usa, seus custos e quantidades
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Monte seus Produtos</h3>
              <p className="text-muted-foreground">
                Crie produtos compostos selecionando os insumos e quantidades necessárias
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Preço Calculado</h3>
              <p className="text-muted-foreground">
                O sistema calcula automaticamente o preço ideal considerando todos os custos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-4xl border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="size-4" />
                100% Gratuito
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Comece a precificar melhor hoje mesmo
              </h2>
              <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
                Não perca mais tempo calculando preços manualmente. Cadastre-se agora e tenha acesso 
                completo a todas as funcionalidades, sem custo algum.
              </p>
              {!user && (
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Criar Conta Grátis
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              )}
              <p className="mt-6 text-sm text-muted-foreground">
                ✓ Sem cartão de crédito &nbsp;•&nbsp; ✓ Sem período de teste &nbsp;•&nbsp; ✓ Grátis para sempre
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Signup Section */}
      <section id="signup" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <SignupForm>
            <SignupFormLayout>
              <div className="hidden lg:block">
                <SignupFormBenefits />
              </div>
              
              <div className="w-full">
                <SignupFormContainer>
                  <SignupFormHeader />
                  <SignupFormForm>
                    <SignupFormFields />
                    <SignupFormMessages />
                    <SignupFormActions />
                  </SignupFormForm>
                  <SignupFormFooter />
                </SignupFormContainer>
                
                <SignupFormMobileBenefits />
              </div>
            </SignupFormLayout>
          </SignupForm>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Pronto para precificar com inteligência?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            Comece agora mesmo, 100% grátis. Sem cartão de crédito, sem compromisso.
          </p>
          {!user && (
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">
                Começar Gratuitamente
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export default Page;