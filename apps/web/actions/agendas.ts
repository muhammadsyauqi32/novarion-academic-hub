'use server';

import { requireAuth } from '@/lib/auth/guards';
import { getDb, agendas, auditLogs } from '@novarion/db';
import { agendaSubmissionSchema } from '@novarion/shared';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitAgendaAction(formData: FormData) {
  const user = await requireAuth();
  const db = getDb();

  const deadlineRaw = formData.get('deadline');
  const deadline = deadlineRaw ? new Date(String(deadlineRaw)).toISOString() : null;

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    category: formData.get('category'),
    scope: formData.get('scope'),
    deadline: deadline || undefined,
    location_or_link: formData.get('location_or_link') || undefined,
    source_reference: formData.get('source_reference') || undefined,
  };

  const parsed = agendaSubmissionSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { title, description, category, scope, location_or_link, source_reference } = parsed.data;

  try {
    const inserted = await db.insert(agendas).values({
      title,
      description,
      category,
      scope,
      deadline: deadline ? new Date(deadline) : null,
      locationOrLink: location_or_link,
      sourceReference: source_reference,
      createdBy: user.id,
      status: 'pending', // Wajib pending jika diajukan mahasiswa
    }).returning();

    await db.insert(auditLogs).values({
      actorId: user.id,
      action: 'AGENDA_PROPOSED',
      entityType: 'agendas',
      entityId: inserted[0].id,
      newValues: { title, category, scope },
    });

    revalidatePath('/app/submissions');
    revalidatePath('/app/agendas');
  } catch (err) {
    return { success: false, error: String(err) };
  }

  redirect('/app/submissions');
}
