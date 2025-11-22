import { revalidatePath } from 'next/cache';
import PageContent from '@/components/ui/PageContent/PageContent';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { withAuth } from '@/domains/core/auth';
import type { WithAuthProps } from '@/domains/core/auth';
import { ProductProvider } from '@/domains/products/context/ProductContext';
import { ProductForm, type ProductFormData } from '@/domains/products/components/ProductForm';
import { PriceBreakdown } from '@/domains/products/components/PriceBreakdown';
import { createProduct } from '@/domains/products/repositories/product.repository';
import { listSupplies } from '@/domains/supplies/repositories/supplies.repository';
import { getOrCreateSettings } from '@/domains/settings/services/settings.service';
import { getUserWithAccount } from '@/domains/users/repositories/user.repository';

export const metadata = {
  title: 'Novo Produto',
};

const NewProductPage = async ({ user }: WithAuthProps) => {
  // Fetch all supplies for the form
  const supplies = await listSupplies();
  
  // Get account settings for price calculation
  const { account } = await getUserWithAccount();
  const settings = await getOrCreateSettings(account.id);

  // Handler: Create a new product
  const handleCreateProduct = async (data: ProductFormData) => {
    'use server';
    await createProduct(data);
    revalidatePath('/products');
  };

  return (
    <ProductProvider>
      <PageHeader>
        <PageTitle>Novo Produto</PageTitle>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductForm 
              supplies={supplies}
              settings={settings}
              onSubmit={handleCreateProduct}
              submitLabel="Criar Produto"
            />
          </div>
          
          <div className="lg:col-span-1">
            <PriceBreakdown 
              supplies={supplies}
              settings={settings}
            />
          </div>
        </div>
      </PageContent>
    </ProductProvider>
  );
};

export default withAuth(NewProductPage);
