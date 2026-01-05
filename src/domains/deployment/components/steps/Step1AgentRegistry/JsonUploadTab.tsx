'use client';

import { UploadCloud, XCircle, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JsonUploadTabProps {
  jsonFile: File | null;
  jsonData: any;
  errors: string | null;
  isUploadedJsonValid: boolean;
  loading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export function JsonUploadTab({
  jsonFile,
  jsonData,
  errors,
  isUploadedJsonValid,
  loading,
  onFileChange,
  onSubmit,
}: JsonUploadTabProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex-1 w-full">
          <label
            htmlFor="jsonUpload"
            className="flex items-center justify-center gap-2 cursor-pointer rounded-md border border-dashed border-border p-4 transition-colors hover:bg-muted"
          >
            <UploadCloud className="w-6 h-6" />
            <span className="text-sm">
              {jsonFile ? jsonFile.name : 'Click to upload JSON file'}
            </span>
          </label>
          <input
            type="file"
            id="jsonUpload"
            accept=".json,application/json"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </div>

      {jsonData && (
        <div className="bg-muted p-4 rounded-md overflow-auto max-h-64 mt-4">
          <h4 className="text-sm font-semibold mb-2">Uploaded JSON Preview</h4>
          <pre className="text-sm font-mono">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}

      {errors && (
        <p className="flex items-center gap-2 border-2 border-red-500 rounded-[5px] p-3 text-red-500 text-sm mt-2 bg-red-50 dark:bg-red-950/20">
          <XCircle className="w-5 h-5 mt-[2px] flex-shrink-0" />
          {errors}
        </p>
      )}

      {jsonData && !errors && (
        <Button
          className="w-full flex items-center gap-2 mt-4"
          onClick={onSubmit}
          disabled={!isUploadedJsonValid || loading}
        >
          <CheckIcon className="w-4 h-4" /> Use Uploaded JSON & Submit
        </Button>
      )}
    </>
  );
}

















