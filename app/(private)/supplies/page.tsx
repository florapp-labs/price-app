import PageContent from "@/components/ui/PageContent/PageContent";
import { PageHeader, PageTitle } from "@/components/ui/PageHeader";
import PageDescription from "@/components/ui/PageHeader/PageActions";
import { withAuth } from "@/domains/core/auth";
import type { WithAuthProps } from "@/domains/core/auth";
import { getSupplies } from "@/domains/supplies/repositories/supplies.repository";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Materiais",
};

interface SuppliesPageProps extends WithAuthProps {
  searchParams?: Promise<{
    cursor?: string;
    pageSize?: string;
  }>;
}

const SuppliesPage = async ({ user, searchParams }: SuppliesPageProps) => {
  const resolvedSearchParams = await searchParams;
  const pageSize = resolvedSearchParams?.pageSize ? parseInt(resolvedSearchParams.pageSize) : 10;
  const cursor = resolvedSearchParams?.cursor;

  const { supplies, hasMore, nextCursor, total } = await getSupplies(pageSize, cursor);
  
  return (<>
    <PageHeader>
      <PageTitle>Materiais</PageTitle>
      <PageDescription>Gerencie seus materiais e custos</PageDescription>
    </PageHeader>

    <PageContent>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Total de {total} material{total !== 1 ? 'is' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/supplies/add">
            <Plus className="h-4 w-4" />
            Novo Material
          </Link>
        </Button>
      </div>

      <Separator />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supplies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                Nenhum material cadastrado
              </TableCell>
            </TableRow>
          ) : (
            supplies.map((supply) => (
              <TableRow key={supply.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{supply.name}</div>
                    {supply.description && (
                      <div className="text-sm text-muted-foreground">{supply.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono">
                    R$ {supply.cost.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/supplies/${supply.id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>
                        </svg>
                        Editar
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {(hasMore || cursor) && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Mostrando {supplies.length} de {total} materiais
          </div>
          <div className="flex gap-2">
            {cursor && (
              <Button variant="outline" asChild>
                <a href="/supplies">Primeira página</a>
              </Button>
            )}
            {hasMore && nextCursor && (
              <Button variant="outline" asChild>
                <a href={`/supplies?cursor=${nextCursor}`}>Próxima página</a>
              </Button>
            )}
          </div>
        </div>
      )}
    </PageContent>
  </>);
}

export default withAuth(SuppliesPage);
