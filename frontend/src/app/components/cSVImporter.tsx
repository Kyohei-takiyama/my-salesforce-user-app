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
    if (!file) return;

    // FileReader で文字コードを指定しつつ読み込む
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;

      // 読み込んだテキストを Papa.parse に渡す
      Papa.parse(e.target.result as string, {
        header: true, // 1行目をヘッダーとして使う
        skipEmptyLines: true, // 空行をスキップ
        complete: (results) => {
          onDataImported(results.data);
        },
      });
    };

    // CSV が Shift_JIS でエンコードされている場合
    // UTF-8 なら "utf-8" に変更
    reader.readAsText(file, "Shift_JIS");
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
