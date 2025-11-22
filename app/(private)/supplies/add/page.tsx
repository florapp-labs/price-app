import { revalidatePath } from 'next/cache';
import PageContent from '@/components/ui/PageContent/PageContent';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { withAuth } from '@/domains/core/auth';
import type { WithAuthProps } from '@/domains/core/auth';
import { SupplyForm, type SupplyFormData } from '@/domains/supplies/components/SupplyForm';
import { createSupply } from '@/domains/supplies/repositories/supplies.repository';

export const metadata = {
  title: 'Novo Material',
};

const AddSupplyPage = async ({ user }: WithAuthProps) => {
  // Handler: Create a new supply
  const handleCreateSupply = async (data: SupplyFormData) => {
    'use server';
    await createSupply(data);
    revalidatePath('/supplies');
  };

  return (
    <>
      <PageHeader>
        <PageTitle>Novo Material</PageTitle>
      </PageHeader>

      <PageContent>
        <div className="max-w-2xl">
          <SupplyForm 
            onSubmit={handleCreateSupply}
            submitLabel="Criar Material"
          />
        </div>
      </PageContent>
    </>
  );
};

export default withAuth(AddSupplyPage);
