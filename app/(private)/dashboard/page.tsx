import { Button } from "@/components/ui/button";
import PageContent from "@/components/ui/PageContent/PageContent";
import { PageHeader, PageTitle } from "@/components/ui/PageHeader";
import PageDescription from "@/components/ui/PageHeader/PageActions";
import { withAuth } from "@/domains/core/auth";
import type { WithAuthProps } from "@/domains/core/auth";
import { Home } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard",
  description: "User dashboard - private route",
};

const DashboardPage = async ({user}: WithAuthProps) => {
  return (<>
    <PageHeader>
      <PageTitle>Dashboard</PageTitle>
      <PageDescription>central sobre seus produtos</PageDescription>
    </PageHeader>

    <PageContent>
      <p>You are in a private route, {user.name}!</p>

      <Button asChild variant="default">
        <Link
          href="/logout"
        >
          Logout
        </Link>
      </Button>
    </PageContent>
  </>);
}

export default withAuth(DashboardPage);