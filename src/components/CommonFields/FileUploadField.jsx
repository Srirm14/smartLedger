import { useState } from "react";
import { Controller } from "react-hook-form";
import { Upload, X, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileUploadField({
  control,
  name,
  label,
  accept = "image/*,.pdf",
  maxSize = 5, // in MB
  disabled = false,
  readonly = false,
  required = false,
}) {
  const [preview, setPreview] = useState(null);
  
  const isImage = (file) => {
    return file && file.type && file.type.startsWith('image/');
  };
  
  const renderPreview = (file) => {
    if (!file) return null;
    
    if (isImage(file)) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    
    setPreview(null);
    return null;
  };
  
  const formatFileSize = (size) => {
    if (size < 1024) return size + ' B';
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    else return (size / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray200)]">
        {label} {required && <span className="text-[var(--danger-500)] dark:text-[var(--danger-400)]">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label} is required` : false }}
        render={({ field: { onChange, value, ...field }, fieldState: { error } }) => {
          const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > maxSize * 1024 * 1024) {
              alert(`File size must be less than ${maxSize}MB`);
              return;
            }
            
            renderPreview(file);
            onChange(file);
          };
          
          const clearFile = () => {
            onChange(null);
            setPreview(null);
          };
          
          return (
            <div className="relative w-full">
              {readonly ? (
                <div className="min-h-[2.5rem] py-2 px-3 border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
                  {value ? (
                    <div className="flex items-center space-x-2">
                      {isImage(value) ? (
                        <Image className="h-4 w-4 text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]" />
                      ) : (
                        <FileText className="h-4 w-4 text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]" />
                      )}
                      <span className="text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                        {value.name} ({formatFileSize(value.size)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">No file uploaded</span>
                  )}
                </div>
              ) : (
                <div className="relative">
                  {value ? (
                    <div className="border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] rounded-md p-3 bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isImage(value) ? (
                            <Image className="h-4 w-4 text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]" />
                          ) : (
                            <FileText className="h-4 w-4 text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]" />
                          )}
                          <span className="text-sm text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">
                            {value.name} ({formatFileSize(value.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={clearFile}
                          disabled={disabled}
                          className="text-[var(--neutral-gray500)] hover:text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray400)] dark:hover:text-[var(--neutral-gray200)]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {preview && (
                        <div className="mt-2">
                          <img
                            src={preview}
                            alt="Preview"
                            className="max-h-40 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] rounded-md p-6 flex flex-col items-center bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)]">
                      <Upload className="h-8 w-8 text-[var(--neutral-gray400)] dark:text-[var(--neutral-gray500)] mb-2" />
                      <p className="text-sm text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
                        Drag and drop your file here, or{" "}
                        <label
                          htmlFor={`file-upload-${name}`}
                          className="text-[var(--primary-500)] hover:text-[var(--primary-600)] dark:text-[var(--primary-400)] dark:hover:text-[var(--primary-300)] cursor-pointer font-medium"
                        >
                          browse
                        </label>
                      </p>
                      <p className="text-xs text-[var(--neutral-gray400)] dark:text-[var(--neutral-gray500)] mt-1">
                        Max file size: {maxSize}MB
                      </p>
                      <input
                        id={`file-upload-${name}`}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={disabled}
                        className="sr-only"
                        {...field}
                      />
                    </div>
                  )}
                </div>
              )}
              {error && (
                <p className="text-[var(--danger-500)] dark:text-[var(--danger-400)] text-sm mt-1">{error.message}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
} 