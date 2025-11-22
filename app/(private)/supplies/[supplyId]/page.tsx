import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import PageContent from '@/components/ui/PageContent/PageContent';
import { PageHeader, PageTitle } from '@/components/ui/PageHeader';
import { withAuth } from '@/domains/core/auth';
import type { WithAuthProps } from '@/domains/core/auth';
import { getSupplyById, updateSupply } from '@/domains/supplies/repositories/supplies.repository';
import { SupplyForm, type SupplyFormData } from '@/domains/supplies/components/SupplyForm';

export const metadata = {
  title: 'Editar Material',
};

interface EditSupplyPageProps extends WithAuthProps {
  params: Promise<{
    supplyId: string;
  }>;
}

const EditSupplyPage = async ({ params }: EditSupplyPageProps) => {
  const { supplyId } = await params;

  // Fetch supply by ID (already validates account ownership)
  const supply = await getSupplyById(supplyId);

  if (!supply) {
    notFound();
  }

  // Handler: Update existing supply
  const handleUpdateSupply = async (data: SupplyFormData) => {
    'use server';
    await updateSupply(supplyId, data);
    revalidatePath('/supplies');
    revalidatePath(`/supplies/${supplyId}`);
  };

  return (
    <>
      <PageHeader>
        <PageTitle>Editar Material</PageTitle>
      </PageHeader>

      <PageContent>
        <div className="max-w-2xl">
          <SupplyForm 
            supply={supply} 
            onSubmit={handleUpdateSupply}
            submitLabel="Salvar Alterações"
          />
        </div>
      </PageContent>
    </>
  );
};

export default withAuth(EditSupplyPage);
