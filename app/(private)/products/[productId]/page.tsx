import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import PageContent from '@/components/ui/PageContent/PageContent';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { withAuth } from '@/domains/core/auth';
import type { WithAuthProps } from '@/domains/core/auth';
import { ProductProvider } from '@/domains/products/context/ProductContext';
import { getProductById, updateProduct } from '@/domains/products/repositories/product.repository';
import { ProductForm, type ProductFormData } from '@/domains/products/components/ProductForm';
import { PriceBreakdown } from '@/domains/products/components/PriceBreakdown';
import { listSupplies } from '@/domains/supplies/repositories/supplies.repository';
import { getOrCreateSettings } from '@/domains/settings/services/settings.service';
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Editar Produto',
};

interface EditProductPageProps extends WithAuthProps {
  params: Promise<{
    productId: string;
  }>;
}

const EditProductPage = async ({ params }: EditProductPageProps) => {
  const { productId } = await params;

  // Fetch product by ID (already validates account ownership)
  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  // Fetch all supplies for the form
  const supplies = await listSupplies();
  
  // Get account settings for price calculation
  const { account } = await getUserWithAccount();
  const settings = await getOrCreateSettings(account.id);

  // Handler: Update existing product
  const handleUpdateProduct = async (data: ProductFormData) => {
    'use server';
    await updateProduct(productId, data);
    revalidatePath('/products');
    revalidatePath(`/products/${productId}`);
  };

  return (
    <ProductProvider initialProduct={product}>
      <PageHeader>
        <PageTitle>Editar Produto</PageTitle>
      </PageHeader>

      {/* <PageContent> */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
                <ProductForm 
                  supplies={supplies}
                  settings={settings}
                  onSubmit={handleUpdateProduct}
                  submitLabel="Salvar Alterações"
                  />
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            {/* <Card>
              <CardContent> */}
                <PriceBreakdown 
                  supplies={supplies}
                  settings={settings}
                />
              {/* </CardContent>
            </Card> */}
          </div>
        </div>
      {/* </PageContent> */}
    </ProductProvider>
  );
};

export default withAuth(EditProductPage);
