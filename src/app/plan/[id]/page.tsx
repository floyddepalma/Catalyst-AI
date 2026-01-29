import { db, businessPlans } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { PlanView } from './PlanView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanPage({ params }: PageProps) {
  const { id } = await params;
  
  const plan = await db.query.businessPlans.findFirst({
    where: eq(businessPlans.id, id),
  });

  if (!plan) {
    notFound();
  }

  return <PlanView plan={plan} />;
}
