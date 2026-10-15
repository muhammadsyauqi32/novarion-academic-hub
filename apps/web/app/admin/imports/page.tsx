'use client';

import React, { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { previewCSVAction, executeCSVAction } from '@/actions/importer';
import { CSVImportPreview, CSVImportResult } from '@/lib/csv/importer';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function CSVImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<CSVImportPreview | null>(null);
  const [result, setResult] = useState<CSVImportResult | null>(null);

  const handleDownloadTemplate = () => {
    const csvContent = [
      'nim,nama,email,role,kelas,mata_kuliah,kelompok',
      '10241002,Ahmad Fauzi,ahmad.f@kampus.ac.id,student,Kelas A,Analisis Regresi Terapan,Kelompok 1',
      '10241003,Siti Rahma,siti.r@kampus.ac.id,student,Kelas A,Analisis Regresi Terapan,Kelompok 1',
      '10241004,Dian Pratama,dian.p@kampus.ac.id,admin,Kelas B,Komputasi Statistika,Kelompok 2',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_roster_novarion.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const previewData = await previewCSVAction(text, selectedFile.name);
      setPreview(previewData);
    } catch (err) {
      alert('Gagal membaca file CSV: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) return;
    setIsProcessing(true);

    try {
      const res = await executeCSVAction(preview);
      setResult(res);
      setPreview(null);
      setFile(null);
    } catch (err) {
      alert('Gagal mengeksekusi impor data: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-text-primary tracking-tight">
            Impor Roster & Whitelist CSV
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Impor massal data mahasiswa angkatan dengan validasi baris, deteksi duplikat, dan upsert idempoten.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          <span>Unduh Template CSV</span>
        </Button>
      </div>

      {/* Stepper Indikator */}
      <div className="grid grid-cols-3 gap-2 py-2">
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${file ? 'bg-surface border-border text-teal-deep' : 'bg-surface-soft border-border text-text-muted'}`}>
          <span className="w-5 h-5 rounded-full bg-brand-primary text-text-primary flex items-center justify-center text-[10px] font-bold">1</span>
          <span>Upload File</span>
        </div>
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${preview ? 'bg-surface border-border text-teal-deep' : 'bg-surface-soft border-border text-text-muted'}`}>
          <span className="w-5 h-5 rounded-full bg-brand-primary text-text-primary flex items-center justify-center text-[10px] font-bold">2</span>
          <span>Preview & Validasi</span>
        </div>
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${result ? 'bg-surface border-border text-teal-deep' : 'bg-surface-soft border-border text-text-muted'}`}>
          <span className="w-5 h-5 rounded-full bg-brand-primary text-text-primary flex items-center justify-center text-[10px] font-bold">3</span>
          <span>Laporan Hasil</span>
        </div>
      </div>

      {/* Upload Zone */}
      {!preview && !result && (
        <Card className="p-8 sm:p-12 border-2 border-dashed border-border hover:border-brand-primary/60 transition-colors flex flex-col items-center justify-center text-center gap-4 bg-surface-soft/40">
          <div className="w-16 h-16 rounded-2xl bg-brand-mint-soft text-teal-deep flex items-center justify-center shadow-xs">
            <Upload className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="font-heading font-bold text-base text-text-primary">
              Pilih File CSV Mahasiswa
            </h3>
            <p className="text-xs text-text-muted">
              Mendukung file CSV hasil ekspor Google Sheets atau Excel. Format kolom otomatis dinormalisasi.
            </p>
          </div>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <span className="inline-flex items-center justify-center font-medium rounded-input transition-all duration-150 px-4 py-2 text-sm bg-brand-primary text-text-primary hover:brightness-95 shadow-sm font-semibold gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isProcessing ? 'Membaca File...' : 'Pilih File dari Komputer'}</span>
            </span>
          </label>
        </Card>
      )}

      {/* Preview Section */}
      {preview && (
        <div className="flex flex-col gap-5">
          <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface">
            <div>
              <span className="text-xs font-semibold text-text-muted">Nama File:</span>
              <h3 className="font-heading font-bold text-base text-text-primary">{preview.fileName}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="md">{preview.totalRows} Total Baris</Badge>
              <Badge variant="success" size="md">{preview.validRows.length} Baris Valid</Badge>
              {preview.duplicateCount > 0 && (
                <Badge variant="warning" size="md">{preview.duplicateCount} Duplikat</Badge>
              )}
              {preview.errors.length > 0 && (
                <Badge variant="danger" size="md">{preview.errors.length} Kesalahan</Badge>
              )}
            </div>
          </Card>

          {/* Alert Kesalahan jika ada */}
          {preview.errors.length > 0 && (
            <Card className="p-4 bg-danger-surface border-danger-border flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-danger-text">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Ditemukan {preview.errors.length} baris dengan kesalahan:</span>
              </div>
              <ul className="text-xs text-danger-text/90 space-y-1 max-h-36 overflow-y-auto pl-5 list-disc">
                {preview.errors.map((e, idx) => (
                  <li key={idx}>
                    Baris {e.row}: {e.message} {e.nim ? `(NIM: ${e.nim})` : ''}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Tabel Preview Valid Rows */}
          <Card className="p-0 overflow-hidden flex flex-col">
            <div className="p-3.5 bg-surface-soft border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary">
                Preview Data yang Akan Diimpor ({preview.validRows.length} data)
              </span>
              <span className="text-[11px] text-text-muted">
                Insert: {preview.validRows.filter((r) => r.action === 'insert').length} • Update: {preview.validRows.filter((r) => r.action === 'update').length}
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs text-text-primary">
                <thead className="bg-surface-soft/60 border-b border-border text-text-muted uppercase text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Aksi</th>
                    <th className="py-2.5 px-3">NIM</th>
                    <th className="py-2.5 px-3">Nama</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.validRows.map((r, i) => (
                    <tr key={i} className="hover:bg-surface-soft/40">
                      <td className="py-2 px-3">
                        <Badge variant={r.action === 'insert' ? 'success' : 'mint'} size="sm">
                          {r.action === 'insert' ? '+ Baru' : '↻ Update'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold">{r.nim}</td>
                      <td className="py-2 px-3">{r.nama}</td>
                      <td className="py-2 px-3 text-text-muted">{r.email}</td>
                      <td className="py-2 px-3 capitalize">{r.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setPreview(null);
                setFile(null);
              }}
              disabled={isProcessing}
            >
              Batalkan
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmImport}
              isLoading={isProcessing}
              disabled={preview.validRows.length === 0}
            >
              Konfirmasi & Eksekusi Impor ({preview.validRows.length} Mahasiswa)
            </Button>
          </div>
        </div>
      )}

      {/* Laporan Hasil Impor */}
      {result && (
        <Card className="p-8 flex flex-col items-center text-center gap-4 bg-surface border-border">
          <div className="w-14 h-14 rounded-full bg-success-surface border border-success-border text-success-text flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-heading font-extrabold text-xl text-text-primary">
              Impor Data Selesai!
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Data mahasiswa telah berhasil diproses ke dalam database whitelist.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-md py-2">
            <div className="p-3 rounded-xl bg-surface-soft border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold">Total Baris</span>
              <p className="text-xl font-heading font-black text-text-primary">{result.totalRows}</p>
            </div>
            <div className="p-3 rounded-xl bg-brand-mint-soft/40 border border-brand-primary/30">
              <span className="text-[10px] text-teal-deep uppercase font-bold">Baru Ditambah</span>
              <p className="text-xl font-heading font-black text-teal-deep">{result.insertedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-soft border border-border">
              <span className="text-[10px] text-text-muted uppercase font-bold">Diperbarui</span>
              <p className="text-xl font-heading font-black text-text-primary">{result.updatedCount}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setResult(null);
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Impor File Lain</span>
            </Button>
            <a href="/admin/students">
              <Button variant="dark" size="md">
                <span>Lihat Data Mahasiswa</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
