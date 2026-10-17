export type UserRole = 'student' | 'admin';

export type AgendaCategory = 
  | 'tugas' 
  | 'kuis' 
  | 'ujian' 
  | 'praktikum' 
  | 'kuliah' 
  | 'kegiatan' 
  | 'pengumuman';

export type AgendaScope = 
  | 'angkatan' 
  | 'mata_kuliah' 
  | 'kelas' 
  | 'kelompok';

export type AgendaStatus = 
  | 'pending' 
  | 'published' 
  | 'rejected' 
  | 'cancelled';

export type TriggerType = 
  | 'h_7' 
  | 'h_3' 
  | 'h_1' 
  | 't_minus_3h';

export type JobStatus = 
  | 'queued' 
  | 'processing' 
  | 'submitted' 
  | 'failed' 
  | 'unknown' 
  | 'cancelled';

export type WAConnectionStatus = 
  | 'connected' 
  | 'connecting' 
  | 'disconnected' 
  | 'requires_repair' 
  | 'error';

export type TaskStatus = 'todo' | 'done';

export type AssetType = 'file_upload' | 'external_link';
export type KnowledgeCategory = 'faq' | 'guide' | 'important_link' | 'reference';
export type PublishStatus = 'draft' | 'published' | 'archived';

export type AppPermission =
  | 'agenda.create'
  | 'agenda.edit'
  | 'agenda.cancel'
  | 'agenda.import'
  | 'agenda.review'
  | 'materials.manage'
  | 'knowledge.manage'
  | 'students.manage'
  | 'permissions.manage'
  | 'website.manage'
  | 'whatsapp.manage'
  | 'audit.read';

export interface UserPermissionItem {
  id: string;
  profileId: string;
  permission: AppPermission;
  termId?: string | null;
  courseId?: string | null;
  classSectionId?: string | null;
  studyGroupId?: string | null;
  grantedBy?: string | null;
  grantedAt: Date;
}

export type CMSContentType = 'update' | 'article';

export interface CMSHero {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  focalPointX: string;
  focalPointY: string;
  status: PublishStatus;
  publishedAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CMSNews {
  id: string;
  type: CMSContentType;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  category: string;
  isFeatured: boolean;
  status: PublishStatus;
  publishedAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CMSAlbum {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  eventDate?: string | null;
  isFeatured: boolean;
  status: PublishStatus;
  photos?: CMSAlbumPhoto[];
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CMSAlbumPhoto {
  id: string;
  albumId: string;
  imageUrl: string;
  caption?: string | null;
  displayOrder: number;
  isFeatured: boolean;
  createdAt: Date;
}

export interface CMSAchievement {
  id: string;
  title: string;
  recipient: string;
  competition: string;
  rank: string;
  category: string;
  level: string;
  eventDate?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isFeatured: boolean;
  status: PublishStatus;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CMSMedia {
  id: string;
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  createdBy?: string | null;
  createdAt: Date;
}

export interface CalculatedTrigger {
  triggerType: TriggerType;
  scheduledFor: Date;
  label: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  nim: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
  mustChangePassword?: boolean;
  isActive?: boolean;
  permissions?: AppPermission[];
}
