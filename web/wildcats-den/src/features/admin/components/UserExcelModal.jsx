import React, { useState } from "react";
import "../styles/UserExcelModal.css";

export default function UserExcelModal({
  onClose,
  onUploadExcel,
  excelMessage,  
  excelError      
}) {
  const [file, setFile] = useState(null);

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const downloadTemplate = () => {
    const header = [
      "firstName,lastName,email,userType,course,organization,affiliation,department,about,location"
    ].join("\n");

    const blob = new Blob([header], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "User_Import_Template.csv";
    link.click();
  };

  return (
    <div className="uem-overlay">
      <div className="uem-card">

        <button className="uem-close" onClick={onClose}>✕</button>

        <h2 className="uem-title">Import Users from Excel</h2>

        <p className="uem-sub">
          Upload an Excel file (.xlsx / .xls) following the required template.
        </p>

        {/* Success Message */}
        {excelMessage && (
          <div className="uem-success-message">
            {excelMessage}
          </div>
        )}

        {/* Error Message */}
        {excelError && (
          <div className="uem-error-message">
            {excelError}
          </div>
        )}

        <button className="uem-template-btn" onClick={downloadTemplate}>
          Download Template
        </button>

        <div
          className="uem-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {!file && <p>Drag & drop Excel file here, or click to browse</p>}

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="uem-file-input"
            onChange={handleFileSelect}
          />

          {file && (
            <div className="uem-file-preview">
              <strong>{file.name}</strong>
              <span>{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}
        </div>

        <div className="uem-actions">
          <button className="uem-btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="uem-btn-primary"
            disabled={!file}
            onClick={() => onUploadExcel(file)}
          >
            Import
          </button>
        </div>

      </div>
    </div>
  );
}
