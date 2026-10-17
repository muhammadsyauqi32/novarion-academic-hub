import React from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { getDb, knowledgeAssets, courses } from '@novarion/db';
import { eq, desc } from 'drizzle-orm';
import { MaterialsClient } from './MaterialsClient';

export default async function MaterialsPage() {
  await requireAuth();
  const db = getDb();

  const materials = await db
    .select({
      id: knowledgeAssets.id,
      title: knowledgeAssets.title,
      description: knowledgeAssets.description,
      assetType: knowledgeAssets.assetType,
      externalUrl: knowledgeAssets.externalUrl,
      courseId: knowledgeAssets.courseId,
      createdAt: knowledgeAssets.createdAt,
      courseName: courses.name,
      courseCode: courses.code,
    })
    .from(knowledgeAssets)
    .leftJoin(courses, eq(knowledgeAssets.courseId, courses.id))
    .where(eq(knowledgeAssets.status, 'published'))
    .orderBy(desc(knowledgeAssets.createdAt));

  return <MaterialsClient initialMaterials={materials} />;
}
