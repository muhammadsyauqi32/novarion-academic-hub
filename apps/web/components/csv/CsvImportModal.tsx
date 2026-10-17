'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  ArrowRight,
  Info,
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  templateFileName: string;
  templateHeaders: string[];
  templateSampleRows: string[][];
  onPreview: (csvContent: string, fileName?: string) => Promise<{ success: boolean; preview?: any; error?: string }>;
  onExecute: (csvContent: string, fileName?: string) => Promise<{ success: boolean; result?: any; error?: string }>;
  renderPreviewTable: (preview: any) => React.ReactNode;
  renderResultSummary?: (result: any) => React.ReactNode;
  onSuccessComplete?: () => void;
}

export function CsvImportModal({
  isOpen,
  onClose,
  title,
  description,
  templateFileName,
  templateHeaders,
  templateSampleRows,
  onPreview,
  onExecute,
  renderPreviewTable,
  renderResultSummary,
  onSuccessComplete,
}: CsvImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [previewData, setPreviewData] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvRows = [
      templateHeaders.join(','),
      ...templateSampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')),
    ];
    const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', templateFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) {
        setErrorMessage('Berkas CSV kosong.');
        return;
      }
      setCsvContent(text);
      await runPreview(text, file.name);
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca berkas CSV.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const runPreview = async (content: string, name: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await onPreview(content, name);
      if (!res.success) {
        setErrorMessage(res.error || 'Validasi CSV gagal.');
        setIsLoading(false);
        return;
      }
      setPreviewData(res.preview);
      setStep('preview');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!csvContent) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await onExecute(csvContent, fileName);
      if (!res.success) {
        setErrorMessage(res.error || 'Eksekusi impor CSV gagal.');
        setIsLoading(false);
        return;
      }
      setResultData(res.result);
      setStep('result');
      if (onSuccessComplete) {
        onSuccessComplete();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCsvContent('');
    setFileName('');
    setPreviewData(null);
    setResultData(null);
    setErrorMessage(null);
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-modal border border-border shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface-soft shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-deep/10 text-teal-deep flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-text-primary">
                {title}
              </h3>
              <p className="text-[11px] text-text-muted">{description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:bg-border/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-danger-surface border border-danger-border text-danger-text text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="flex flex-col gap-5">
              {/* Template Download Banner */}
              <div className="p-4 rounded-xl bg-surface-soft border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-teal-deep shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-text-primary block">Gunakan Template CSV Resmi</span>
                    <span className="text-text-muted text-[11px]">
                      Pastikan urutan kolom sesuai agar validasi dan pemrosesan berjalan lancar.
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="gap-1.5 shrink-0 text-xs"
                >
                  <Download className="w-3.5 h-3.5 text-teal-deep" />
                  <span>Unduh Template CSV</span>
                </Button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-teal-deep rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors bg-surface-soft/40 hover:bg-teal-deep/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-deep/10 text-teal-deep flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">
                    Pilih berkas CSV dari komputer Anda
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Mendukung ekspor dari Google Spreadsheet atau Microsoft Excel (.csv)
                  </p>
                </div>
                <Button variant="secondary" size="sm" type="button" className="mt-1">
                  Pilih Berkas CSV
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 'preview' && previewData && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface-soft border border-border text-xs">
                <div>
                  <span className="font-bold text-text-primary">{fileName}</span>
                  <span className="text-text-muted ml-2">({previewData.totalRows} baris terdeteksi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">
                    {previewData.validRows.length} Valid
                  </Badge>
                  {previewData.errors?.length > 0 && (
                    <Badge variant="danger" size="sm">
                      {previewData.errors.length} Error
                    </Badge>
                  )}
                  {previewData.duplicateCount > 0 && (
                    <Badge variant="orange" size="sm">
                      {previewData.duplicateCount} Duplikat
                    </Badge>
                  )}
                </div>
              </div>

              {/* Errors List if any */}
              {previewData.errors?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-danger-surface border border-danger-border flex flex-col gap-1.5 max-h-48 overflow-y-auto text-xs text-danger-text">
                  <span className="font-bold">Daftar Masalah Baris CSV:</span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    {previewData.errors.map((err: any, idx: number) => (
                      <li key={idx}>
                        Baris {err.row}: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Render custom preview table */}
              <div className="max-h-72 overflow-y-auto border border-border rounded-xl">
                {renderPreviewTable(previewData)}
              </div>
            </div>
          )}

          {/* STEP 3: RESULT */}
          {step === 'result' && resultData && (
            <div className="flex flex-col gap-4 py-4">
              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-success-surface border border-success-border text-success-text flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-extrabold text-base text-text-primary">
                  Impor CSV Berhasil Dieksekusi
                </h4>
                <p className="text-xs text-text-muted">
                  Perubahan telah diterapkan ke database dan dicatat di log audit sistem.
                </p>
              </div>

              {renderResultSummary ? (
                renderResultSummary(resultData)
              ) : (
                <Card className="p-4 bg-surface-soft text-xs flex justify-around text-center">
                  <div>
                    <span className="text-text-muted block">Total Diproses</span>
                    <span className="font-heading font-bold text-base text-text-primary">
                      {resultData.totalRows}
                    </span>
                  </div>
                  {resultData.insertedCount !== undefined && (
                    <div>
                      <span className="text-text-muted block">Data Ditambahkan</span>
                      <span className="font-heading font-bold text-base text-success-text">
                        {resultData.insertedCount}
                      </span>
                    </div>
                  )}
                  {resultData.updatedCount !== undefined && (
                    <div>
                      <span className="text-text-muted block">Data Diperbarui</span>
                      <span className="font-heading font-bold text-base text-teal-deep">
                        {resultData.updatedCount}
                      </span>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-soft flex items-center justify-between shrink-0">
          <div>
            {step === 'preview' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isLoading}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Unggah Ulang</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              {step === 'result' ? 'Selesai & Tutup' : 'Batal'}
            </Button>

            {step === 'preview' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecute}
                isLoading={isLoading}
                disabled={isLoading || previewData?.validRows?.length === 0}
                className="gap-1.5"
              >
                <span>Terapkan Impor ({previewData?.validRows?.length || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
