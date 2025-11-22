import PageContent from "@/components/ui/PageContent/PageContent";
import { PageHeader, PageTitle } from "@/components/ui/PageHeader";
import PageDescription from "@/components/ui/PageHeader/PageActions";
import { withAuth } from "@/domains/core/auth";
import type { WithAuthProps } from "@/domains/core/auth";
import { getProducts } from "@/domains/products/repositories/product.repository";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, TrendingUp } from "lucide-react";
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
  title: "Produtos",
};

interface ProductsPageProps extends WithAuthProps {
  searchParams?: Promise<{
    cursor?: string;
    pageSize?: string;
  }>;
}

const ProductsPage = async ({ user, searchParams }: ProductsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const pageSize = resolvedSearchParams?.pageSize ? parseInt(resolvedSearchParams.pageSize) : 10;
  const cursor = resolvedSearchParams?.cursor;

  const { products, hasMore, nextCursor, total } = await getProducts(pageSize, cursor);
  
  return (<>
    <PageHeader>
      <PageTitle>Produtos</PageTitle>
      <PageDescription>Gerencie seus produtos e preços</PageDescription>
    </PageHeader>

    <PageContent>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Total de {total} produto{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/products/add">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <Separator />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço Sugerido</TableHead>
            <TableHead>Preço Atual</TableHead>
            <TableHead>Diferença</TableHead>
            <TableHead>Materiais</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nenhum produto cadastrado
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const hasPriceIssue = product.currentPrice !== undefined && product.currentPrice < product.price;
              const priceDifference = product.currentPrice !== undefined 
                ? product.currentPrice - product.price 
                : 0;
              
              return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-muted-foreground">{product.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-primary">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {product.currentPrice !== undefined ? (
                    <span className="font-mono">
                      R$ {product.currentPrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {product.currentPrice !== undefined ? (
                    <div className="flex items-center gap-2">
                      {hasPriceIssue ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <span className="font-mono text-destructive font-medium">
                            R$ {Math.abs(priceDifference).toFixed(2)} abaixo
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="font-mono text-green-600 font-medium">
                            R$ {Math.abs(priceDifference).toFixed(2)} acima
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.supplies.length} item{product.supplies.length !== 1 ? 's' : ''}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/products/${product.id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>
                        </svg>
                        Editar
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {(hasMore || cursor) && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Mostrando {products.length} de {total} produtos
          </div>
          <div className="flex gap-2">
            {cursor && (
              <Button variant="outline" asChild>
                <a href="/products">Primeira página</a>
              </Button>
            )}
            {hasMore && nextCursor && (
              <Button variant="outline" asChild>
                <a href={`/products?cursor=${nextCursor}`}>Próxima página</a>
              </Button>
            )}
          </div>
        </div>
      )}
    </PageContent>
  </>);
}

export default withAuth(ProductsPage);