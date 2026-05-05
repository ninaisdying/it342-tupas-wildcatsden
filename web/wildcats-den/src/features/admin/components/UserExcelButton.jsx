import React from "react";
import "../styles/UserExcelButton.css";

export default function UserExcelButton({ onClick }) {
  return (
    <button className="excel-btn" onClick={onClick}>
      Import Excel
    </button>
  );
}
