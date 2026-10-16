import { z } from 'zod';

export const userRoleSchema = z.enum(['student', 'admin']);

export const loginSchema = z.object({
  nim: z
    .string()
    .trim()
    .min(1, 'NIM wajib diisi')
    .max(30, 'NIM maksimal 30 karakter'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Kata sandi saat ini wajib diisi'),
    newPassword: z
      .string()
      .min(8, 'Kata sandi baru minimal 8 karakter')
      .max(100, 'Kata sandi terlalu panjang')
      .regex(/[A-Z]/, 'Kata sandi harus mengandung minimal 1 huruf kapital')
      .regex(/[a-z]/, 'Kata sandi harus mengandung minimal 1 huruf kecil')
      .regex(/[0-9]/, 'Kata sandi harus mengandung minimal 1 angka'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini',
    path: ['newPassword'],
  });

export const studentWhitelistSchema = z.object({
  nim: z
    .string()
    .trim()
    .min(3, 'NIM minimal 3 karakter')
    .max(30, 'NIM maksimal 30 karakter'),
  email: z
    .string()
    .trim()
    .email('Format email tidak valid')
    .toLowerCase(),
  full_name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(150, 'Nama lengkap maksimal 150 karakter'),
  role: userRoleSchema.default('student'),
  is_active: z.boolean().default(true),
});

export const csvStudentRowSchema = z.object({
  nim: z.string().trim().min(1, 'NIM wajib diisi'),
  email: z.string().trim().email('Email tidak valid').toLowerCase(),
  nama: z.string().trim().min(1, 'Nama wajib diisi'),
  role: z.string().trim().optional().transform((val) => {
    if (val && val.toLowerCase() === 'admin') return 'admin' as const;
    return 'student' as const;
  }),
  kelas: z.string().trim().optional(),
  mata_kuliah: z.string().trim().optional(),
  kelompok: z.string().trim().optional(),
});

export const academicTermSchema = z.object({
  code: z.string().trim().min(2, 'Kode semester wajib diisi').max(30),
  name: z.string().trim().min(3, 'Nama semester wajib diisi').max(100),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().default(false),
});

export const courseSchema = z.object({
  code: z.string().trim().min(2, 'Kode mata kuliah wajib diisi').max(20),
  name: z.string().trim().min(2, 'Nama mata kuliah wajib diisi').max(150),
  credits: z.coerce.number().int().min(1).max(10).default(3),
});

export const classSectionSchema = z.object({
  offering_id: z.string().uuid(),
  name: z.string().trim().min(1, 'Nama kelas wajib diisi').max(50),
});

export const studyGroupSchema = z.object({
  class_section_id: z.string().uuid(),
  name: z.string().trim().min(1, 'Nama kelompok wajib diisi').max(50),
});

export const agendaCategorySchema = z.enum([
  'tugas',
  'kuis',
  'ujian',
  'praktikum',
  'kuliah',
  'kegiatan',
  'pengumuman',
]);

export const agendaScopeSchema = z.enum([
  'angkatan',
  'mata_kuliah',
  'kelas',
  'kelompok',
]);

export const agendaSubmissionSchema = z.object({
  title: z.string().trim().min(3, 'Judul agenda minimal 3 karakter').max(200),
  description: z.string().trim().optional(),
  category: agendaCategorySchema,
  scope: agendaScopeSchema,
  start_time: z.string().datetime().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  location_or_link: z.string().trim().optional().nullable(),
  source_reference: z.string().trim().optional().nullable(),
  course_id: z.string().uuid().optional().nullable(),
  class_section_id: z.string().uuid().optional().nullable(),
  study_group_id: z.string().uuid().optional().nullable(),
});
