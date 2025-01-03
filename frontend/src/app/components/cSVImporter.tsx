import { useState, ChangeEvent } from "react";
import Papa from "papaparse";

interface CSVImporterProps {
  onDataImported: (data: any[]) => void;
}

export default function CSVImporter({ onDataImported }: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          onDataImported(result.data);
        },
        header: true,
      });
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-2 p-2 border rounded"
      />
      <button
        onClick={handleImport}
        disabled={!file}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        インポート
      </button>
    </div>
  );
}
