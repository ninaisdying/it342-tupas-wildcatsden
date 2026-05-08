import { useState } from "react";
import "../../../features/admin/styles/UserModal.css";

export default function UserAddModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userType: "",
    about: "",
    location: "",
    course: "",
    organization: "",
    affiliation: "",
    department: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.userType)
      return "Please fill in all required fields.";

    if (form.userType === "Student") {
      if (!form.course || !form.organization)
        return "Course and Organization are required for Students.";
    }

    if (form.userType === "Coordinator") {
      if (!form.affiliation) return "Affiliation is required for Coordinators.";
    }

    if (form.userType === "Faculty") {
      if (!form.department) return "Department is required for Faculty.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const err = validate();
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    let endpoint = "/users";
    if (form.userType === "Student") endpoint = "/students";
    if (form.userType === "Faculty") endpoint = "/faculty";
    if (form.userType === "Coordinator") endpoint = "/coordinators";

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      userType: form.userType,
      about: form.about,
      location: form.location,
      password: "12345678",
      ...(form.userType === "Student" && {
        course: form.course,
        organization: form.organization,
      }),
      ...(form.userType === "Coordinator" && {
        affiliation: form.affiliation,
      }),
      ...(form.userType === "Faculty" && {
        department: form.department,
      }),
    };

    try {
      const res = await fetch(`http://localhost:8080/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await res.clone().text();
      console.log("CREATE RESPONSE:", raw);

      if (!res.ok) {
        setError(raw || "Failed to create user.");
        setLoading(false);
        return;
      }

      const createdUser = await res.json();
      onSave(createdUser);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="umod-overlay" onClick={onClose}>
      <div className="umod-card" onClick={(e) => e.stopPropagation()}>
        <button className="umod-close" onClick={onClose}>✕</button>

        <h3 className="umod-title">Add User</h3>

        {error && <p className="umod-error">{error}</p>}

        <form className="umod-form" onSubmit={handleSubmit}>
          <label className="umod-label" htmlFor="firstName">First Name *</label>
          <input
            id="firstName"
            className="umod-input"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            required
          />

          <label className="umod-label" htmlFor="lastName">Last Name *</label>
          <input
            id="lastName"
            className="umod-input"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            required
          />

          <label className="umod-label" htmlFor="email">Email *</label>
          <input
            id="email"
            className="umod-input"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter user email"
            required
          />

          <label className="umod-label" htmlFor="userType">Role *</label>
          <select
            id="userType"
            className="umod-select"
            name="userType"
            value={form.userType}
            onChange={handleChange}
            required
          >
            <option value="">Select role</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Faculty">Faculty</option>
            <option value="Student">Student</option>
          </select>

          {form.userType === "Student" && (
            <>
              <label className="umod-label" htmlFor="course">Course *</label>
              <input
                id="course"
                className="umod-input"
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Enter course"
                required
              />

              <label className="umod-label" htmlFor="organization">Organization *</label>
              <input
                id="organization"
                className="umod-input"
                name="organization"
                value={form.organization}
                onChange={handleChange}
                placeholder="Enter organization"
                required
              />
            </>
          )}

          {form.userType === "Coordinator" && (
            <>
              <label className="umod-label" htmlFor="affiliation">Affiliation *</label>
              <input
                id="affiliation"
                className="umod-input"
                name="affiliation"
                value={form.affiliation}
                onChange={handleChange}
                placeholder="Enter affiliation"
                required
              />
            </>
          )}

          {form.userType === "Faculty" && (
            <>
              <label className="umod-label" htmlFor="department">Department *</label>
              <input
                id="department"
                className="umod-input"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Enter department"
                required
              />
            </>
          )}

          <label className="umod-label" htmlFor="about">About</label>
          <textarea
            id="about"
            className="umod-textarea"
            name="about"
            value={form.about}
            onChange={handleChange}
            placeholder="Enter additional information"
          />

          <label className="umod-label" htmlFor="location">Location</label>
          <input
            id="location"
            className="umod-input"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter location"
          />

          <div className="umod-actions">
            <button type="button" className="umod-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="umod-btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
