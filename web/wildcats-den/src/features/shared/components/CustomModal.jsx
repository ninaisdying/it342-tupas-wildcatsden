import React from 'react';
import '../../../features/custodian/components/styles/CustomModal.css';

const CustomModal = ({
  isOpen,
  message,
  onClose,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  return (
    <div
      className="cm-modal-overlay"
      onClick={(e) => {
        // close ONLY when clicking outside modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cm-modal-content" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="cm-modal-separator" />

        {onConfirm ? (
          <div className="cm-modal-actions">
            <button className="btn-primary" onClick={onConfirm}>
              {confirmText}
            </button>
            <button className="btn-secondary" onClick={handleCancel}>
              {cancelText}
            </button>
          </div>
        ) : (
          <div className="cm-modal-actions">
            <button className="btn-primary" onClick={onClose}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomModal;
