import { ExternalBlob } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface FileUploadFieldProps {
  label: string;
  accept?: string;
  onFileChange: (blob: ExternalBlob | null) => void;
  preview?: boolean;
}

export function FileUploadField({
  label,
  accept,
  onFileChange,
  preview = false,
}: FileUploadFieldProps) {
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProgress(0);
      setPreviewUrl(null);
      setFileName(null);
      onFileChange(null);
      return;
    }

    setFileName(file.name);
    setProgress(10);

    try {
      if (preview && file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      }

      setProgress(40);

      const buffer = await file.arrayBuffer();
      setProgress(70);

      const blob = ExternalBlob.fromBytes(
        new Uint8Array(buffer),
        file.type,
        file.name,
      );
      setProgress(100);
      onFileChange(blob);
    } catch (err) {
      console.error("File upload failed:", err);
      setProgress(0);
      setPreviewUrl(null);
      setFileName(null);
      onFileChange(null);
    }
  };

  const handleClear = () => {
    setProgress(0);
    setPreviewUrl(null);
    setFileName(null);
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="file-upload-input"
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="file-upload-input"
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="flex-1 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground hover:file:bg-primary/90"
        />
        {(fileName || previewUrl) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            Hapus
          </Button>
        )}
      </div>

      {fileName && (
        <p className="text-xs text-muted-foreground truncate">{fileName}</p>
      )}

      {progress > 0 && progress < 100 && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Mengunggah {progress}%
          </p>
        </div>
      )}

      {preview && previewUrl && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Pratinjau"
            className="max-h-40 rounded-md border border-border object-cover"
          />
        </div>
      )}
    </div>
  );
}
