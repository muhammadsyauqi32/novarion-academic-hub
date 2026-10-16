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
}
