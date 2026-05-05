import React, { useState } from "react";
import ProfileDetails from "./ProfileDetails";
import ExtendProfile from "./ExtendProfile";
import CustomModal from "../../shared/components/CustomModal";
import "../styles/AccountLayout.css";

export default function EditAccountPage() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    type: "success" 
  });

  const showSuccessModal = (message) => {
    setModalState({
      isOpen: true,
      message: message,
      type: "success"
    });
  };

  const showErrorModal = (message) => {
    setModalState({
      isOpen: true,
      message: message,
      type: "error"
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="account-layout">
      <div className="account-columns editing">
        {/* Pass modal functions to both components */}
        <ProfileDetails 
          showSuccessModal={showSuccessModal}
          showErrorModal={showErrorModal}
        />
        <ExtendProfile 
          isEditing={true}
          showSuccessModal={showSuccessModal}
          showErrorModal={showErrorModal}
        />
      </div>

      {/* Single shared modal */}
      <CustomModal
        isOpen={modalState.isOpen}
        message={modalState.message}
        onClose={closeModal}
      />
    </div>
  );
}