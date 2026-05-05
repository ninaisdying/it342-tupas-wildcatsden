import { useState } from "react";
import { authAPI } from "../api/api";
import "../styles/SignUpModal.css";
import CustomModal from "./CustomModal";

export default function SignUpModal({ onClose, openSignIn }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    course: "",
    organization: "",
    affiliation: "",
    department: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
    course: "",
    organization: "",
    affiliation: "",
    department: "",
  });

  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [closeAfterModal, setCloseAfterModal] = useState(false);

  const handleAction = (message, shouldCloseParent = false) => {
    setModalMessage(message);
    setCloseAfterModal(shouldCloseParent);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMessage("");

    if (closeAfterModal) {
      setCloseAfterModal(false);
      onClose();
      openSignIn();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear the specific field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    
    // Clear general error if it exists
    if (generalError) {
      setGeneralError("");
    }
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required";
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!value.trim()) {
          error = "Password is required";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters long";
        }
        break;
      case "confirmPassword":
        if (!value.trim()) {
          error = "Please confirm your password";
        } else if (value !== form.password) {
          error = "Passwords do not match";
        }
        break;
      case "userType":
        if (!value) error = "Please select a role";
        break;
      case "course":
        if (form.userType === "Student" && !value.trim()) {
          error = "Course is required for Students";
        }
        break;
      case "organization":
        if (form.userType === "Student" && !value.trim()) {
          error = "Organization is required for Students";
        }
        break;
      case "affiliation":
        if (form.userType === "Coordinator" && !value.trim()) {
          error = "Affiliation is required for Coordinators";
        }
        break;
      case "department":
        if (form.userType === "Faculty" && !value.trim()) {
          error = "Department is required for Faculty";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newFieldErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(form).forEach((fieldName) => {
      const error = validateField(fieldName, form[fieldName]);
      if (error) {
        newFieldErrors[fieldName] = error;
        isValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Clear all errors
    setGeneralError("");
    setFieldErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "",
      course: "",
      organization: "",
      affiliation: "",
      department: "",
    });

    // Validate form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        userType: form.userType,
        ...(form.userType === "Student" && { 
          course: form.course, 
          organization: form.organization 
        }),
        ...(form.userType === "Coordinator" && { 
          affiliation: form.affiliation 
        }),
        ...(form.userType === "Faculty" && { 
          department: form.department 
        }),
      };

      await authAPI.signUp(userData);

      handleAction("Account created successfully!", true);

    } catch (err) {
      const message = err?.message || "Sign up failed. Please try again.";
      
      if (message.toLowerCase().includes("email")) {
        setFieldErrors({ ...fieldErrors, email: message });
      } else {
        setGeneralError(message);
      }
      
      handleAction(message, false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (name, label, type = "text", placeholder = "", required = true) => (
    <div className="form-field-group">
      <label className="label">{label} {required && "*"}</label>
      <input
        className={`input-pill ${fieldErrors[name] ? 'input-error' : ''}`}
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
      {fieldErrors[name] && (
        <div className="field-error-text">{fieldErrors[name]}</div>
      )}
    </div>
  );

  const renderSelectField = (name, label, options, required = true) => (
    <div className="form-field-group">
      <label className="label">{label} {required && "*"}</label>
      <select
        className={`input-pill ${fieldErrors[name] ? 'input-error' : ''}`}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required={required}
      >
        {options}
      </select>
      {fieldErrors[name] && (
        <div className="field-error-text">{fieldErrors[name]}</div>
      )}
    </div>
  );

  return (
    <>
      <div className="signup-modal">
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={onClose}>✕</button>

            <h2 className="signup-title">Sign Up</h2>

            {generalError && <p className="error-text general-error">{generalError}</p>}

            <form className="modal-form" onSubmit={handleSubmit}>
              {renderField("firstName", "First Name", "text", "Enter your first name")}
              {renderField("lastName", "Last Name", "text", "Enter your last name")}
              {renderField("email", "Email", "email", "Enter your email")}
              {renderField("password", "Password", "password", "Create a password")}
              {renderField("confirmPassword", "Confirm Password", "password", "Confirm your password")}

              {renderSelectField("userType", "Role", 
                <>
                  <option value="">Select Role</option>
                  <option value="Student">Student</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Faculty">Faculty</option>
                </>
              )}

              {form.userType === "Student" && (
                <>
                  {renderField("course", "Course", "text", "e.g., BSIT")}
                  {renderField("organization", "Organization", "text", "e.g., CCS")}
                </>
              )}

              {form.userType === "Coordinator" && (
                <>
                  {renderField("affiliation", "Affiliation", "text", "Enter organization")}
                </>
              )}

              {form.userType === "Faculty" && (
                <>
                  {renderField("department", "Department", "text", "Enter department")}
                </>
              )}

              <button type="submit" className="btn-continue" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <hr className="divider" />

            <div className="switch-row">
              <p>
                Already have an account?{" "}
                <button
                  className="link-button"
                  onClick={() => {
                    onClose();
                    openSignIn();
                  }}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <CustomModal 
        isOpen={isModalOpen} 
        message={modalMessage} 
        onClose={handleCloseModal}
      />
    </>
  );
}