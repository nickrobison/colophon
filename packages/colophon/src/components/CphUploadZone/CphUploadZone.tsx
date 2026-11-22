import { useState } from "react";
import {
  DropZone,
  FileTrigger,
  type DropZoneProps,
  type FileDropItem,
} from "react-aria-components";

import { CphButton } from "../Button/CphButton";
import { CphMeter } from "../Meter/Meter";

export interface CphUploadZoneProps {
  /** Accessible name for the drop zone and its trigger. */
  label: string;
  /** Accepted file types, e.g. [".pdf"], ["application/pdf"], or ["image/*"]. Empty accepts all. */
  accept?: readonly string[];
  /** Hint text displayed while the zone is idle. */
  hints?: readonly string[];
  /** Whether multiple files may be selected or dropped. Defaults to false. */
  multiple?: boolean;
  /** Whether the zone is disabled. Automatically disabled while uploading. */
  disabled?: boolean;
  /** Whether an upload is in progress. Drives the progress meter. */
  isUploading?: boolean;
  /** Upload progress percentage (0–100) rendered while uploading. */
  progress?: number;
  /** Error message rendered while the upload fails. */
  error?: string;
  /** Called with the accepted files after a selection or drop. */
  onSelect?: (files: File[]) => void;
  className?: string;
}

type OnDrop = NonNullable<DropZoneProps["onDrop"]>;

const EMPTY_ACCEPT: readonly string[] = [];
const DEFAULT_HINT: readonly string[] = ["Drop files here or select above."];

function isAccepted(file: File, accept: readonly string[] | undefined): boolean {
  if (accept === undefined || accept.length === 0) {
    return true;
  }
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept.some((entry) => {
    const candidate = entry.trim().toLowerCase();
    if (candidate === "*/*") {
      return true;
    }
    if (candidate === "") {
      return false;
    }
    if (candidate.endsWith("/*")) {
      return type.startsWith(candidate.slice(0, -1));
    }
    if (candidate.startsWith(".")) {
      return name.endsWith(candidate);
    }
    if (candidate.includes("/")) {
      return type === candidate;
    }
    return name.endsWith(`.${candidate}`);
  });
}

export function CphUploadZone({
  label,
  accept,
  hints,
  multiple = false,
  disabled,
  isUploading = false,
  progress = 0,
  error,
  onSelect,
  className,
}: CphUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const isDisabled = disabled || isUploading;
  const resolvedHints = hints ?? DEFAULT_HINT;

  const handleSelect = (fileList: FileList | null) => {
    const files = fileList ? Array.from(fileList).filter((file) => isAccepted(file, accept)) : [];
    if (files.length === 0) {
      return;
    }
    const acceptedFiles = multiple ? files : [files[0] as File];
    setSelectedFiles(acceptedFiles);
    onSelect?.(acceptedFiles);
  };

  const handleDrop = async (event: Parameters<OnDrop>[0]) => {
    const fileItems = event.items.filter((item): item is FileDropItem => item.kind === "file");
    const files = await Promise.all(fileItems.map((item) => item.getFile()));
    const acceptedFiles = files.filter((file) => isAccepted(file, accept));
    if (acceptedFiles.length === 0) {
      return;
    }
    const chosenFiles = multiple ? acceptedFiles : [acceptedFiles[0] as File];
    setSelectedFiles(chosenFiles);
    onSelect?.(chosenFiles);
  };

  const zoneClassName = className ? `cph-upload-zone ${className}` : "cph-upload-zone";

  return (
    <DropZone
      aria-label={label}
      isDisabled={isDisabled}
      onDrop={handleDrop}
      className={zoneClassName}
    >
      <div className="cph-upload-zone__inner">
        <FileTrigger
          acceptedFileTypes={accept ?? EMPTY_ACCEPT}
          allowsMultiple={multiple}
          onSelect={handleSelect}
        >
          <CphButton variant="secondary" isDisabled={isDisabled}>
            {label}
          </CphButton>
        </FileTrigger>
        {isUploading ? (
          <CphMeter value={progress} max={100} ariaLabel={`Upload progress for ${label}`} />
        ) : selectedFiles.length > 0 ? (
          <ul className="cph-upload-zone__files">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`} className="cph-upload-zone__file">
                {`${file.name} (${file.size} B)`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="cph-upload-zone__hint">{resolvedHints.join(" · ")}</p>
        )}
        {error ? (
          <p className="cph-upload-zone__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </DropZone>
  );
}
