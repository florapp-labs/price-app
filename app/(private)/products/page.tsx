import PageContent from "@/components/ui/PageContent/PageContent";
import { PageHeader, PageTitle } from "@/components/ui/PageHeader";
import PageDescription from "@/components/ui/PageHeader/PageActions";
import { withAuth } from "@/domains/core/auth";
import type { WithAuthProps } from "@/domains/core/auth";
import { Product } from "@/domains/products/types/product.types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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


async function getData(): Promise<Product[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      name: "Buquê de 3 Rosas Vermelhas",
      price: 100.0,
      accountId: "account_123",
      ingredients: [
        {
          materialId: "mat_rose_red",
          quantity: 3,
          unit: "un",
        }
      ],
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    },
    {
      id: "728ed52f2",
      name: "Product Name 2",
      price: 150.0,
      accountId: "account_123",
      ingredients: [],
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    },
    {
      id: "728ed52f3",
      name: "Product Name 3",
      price: 75.50,
      accountId: "account_123",
      ingredients: [],
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    },
  ]
}

const ProductsPage = async ({user}: WithAuthProps) => {

  const data = await getData();
  
  return (<>
    <PageHeader>
      <PageTitle>Produtos</PageTitle>
      <PageDescription>Gerencie seus produtos e preços</PageDescription>
    </PageHeader>

    <PageContent>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Total de {data.length} produto{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Separator />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Insumos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nenhum produto cadastrado
              </TableCell>
            </TableRow>
          ) : (
            data.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <span className="font-mono">
                    R$ {product.price.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.ingredients.length} item{product.ingredients.length !== 1 ? 's' : ''}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      Ver
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>
                      </svg>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </PageContent>
  </>);
}

export default withAuth(ProductsPage);