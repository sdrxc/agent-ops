'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface JsonEditorTabProps {
  jsonEditorValue: string;
  onJsonEditorChange: (value: string) => void;
  isJsonValid: boolean;
  errors: string | null;
  localErrors: string[];
  loading: boolean;
  onSubmit: () => void;
}

export function JsonEditorTab({
  jsonEditorValue,
  onJsonEditorChange,
  isJsonValid,
  errors,
  localErrors,
  loading,
  onSubmit,
}: JsonEditorTabProps) {
  return (
    <div className="bg-muted p-4 rounded-md space-y-4">
      <Textarea
        value={jsonEditorValue}
        onChange={(e) => onJsonEditorChange(e.target.value)}
        className="font-mono text-sm h-64 resize-none"
      />
      <Button
        disabled={!isJsonValid || !!errors || localErrors.length > 0 || loading}
        className="w-full flex items-center gap-2"
        onClick={onSubmit}
      >
        <CheckCircle2 className="w-4 h-4" /> Use Edited JSON & Submit
      </Button>
      {localErrors.length > 0 && (
        <ul className="border-2 border-red-500 rounded-[5px] p-3 text-red-500 text-sm mt-2 space-y-1 bg-red-50 dark:bg-red-950/20">
          {localErrors.map((err, idx) => (
            <li key={idx} className="flex items-center gap-1">
              <XCircle className="w-4 h-4" /> {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

















