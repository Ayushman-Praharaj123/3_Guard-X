import { useState } from "react";
import { Upload, Camera, AlertTriangle } from "lucide-react";
import { detectHuman } from "../apis/detectionApi.js";

export default function UploadForm({ setResult, setLoading, setImage }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setImage(URL.createObjectURL(file));

    try {
      const data = await detectHuman(file);
      setResult(data);
    } catch {
      setResult({ error: "Guard-X surveillance system connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        Guard-X Surveillance Analysis
      </h3>
      
      <form onSubmit={handleUpload} className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
            dragActive 
              ? 'border-emerald-400 bg-emerald-400/10' 
              : 'border-slate-600 hover:border-emerald-400/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              {file ? (
                <Camera className="w-8 h-8 text-emerald-400" />
              ) : (
                <Upload className="w-8 h-8 text-emerald-400" />
              )}
            </div>
            
            {file ? (
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-slate-400 text-sm">Ready for thermal analysis</p>
              </div>
            ) : (
              <div>
                <p className="text-white font-medium mb-2">Upload surveillance image</p>
                <p className="text-slate-400 text-sm">Thermal or RGB images supported</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!file}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <AlertTriangle className="w-5 h-5" />
          Analyze for Human Threats
        </button>
        
        <div className="text-center text-xs text-slate-400">
          <p>Powered by Guard-X AI | NEXTECH 1.0</p>
          <p>CNN & YOLO Neural Networks</p>
        </div>
      </form>
    </div>
  );
}
