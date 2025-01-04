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

  console.log(process.env.API_BASE_ENDPOINT);

  // 「インポート」ボタン押下時: CSVファイルをBase64にしてバックエンドの/importへ送信
  const handleImport = async () => {
    if (!file) return;

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        if (!e.target?.result) return;

        // "data:application/octet-stream;base64,xxxxxx" のような文字列が返るため、
        // カンマ区切りの後ろ部分だけを抽出する
        const base64String = (e.target.result as string).split(",")[1];

        // API Gateway経由のLambda (/import) にPOST
        const response = await fetch(
          "https://7kry00mylg.execute-api.us-west-2.amazonaws.com/dev/import",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              csvBase64: base64String, // Lambda側で event.body.csvBase64 として受け取る
            }),
          }
        );

        if (!response.ok) {
          console.error("Import error:", response.statusText);
          return;
        }

        // 正常にパースされたデータを受け取り、呼び出し元のコンポーネントへ渡す
        const data = await response.json();
        console.log("Import success:", data);
        onDataImported(data.records); // data.records をテーブル表示などに使う
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Import error:", error);
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
