import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getProfile, updateProfile } from "../services/userService";
import { getImageUrl } from "../utils/imageUrl";
import "../styles/profile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    profileImage: null,
  });
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const loadCurrentProfile = async () => {
      try {
        const data = await getProfile();
        setForm((prev) => ({
          ...prev,
          username: data.user.username || "",
          bio: data.user.bio || "",
        }));

        if (data.user.profileImage && data.user.profileImage !== "/uploads/default-avatar.png") {
          setPreview(getImageUrl(data.user.profileImage));
        }
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load profile");
      }
    };

    loadCurrentProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, profileImage: file }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const fd = new FormData();
      fd.append("username", form.username);
      fd.append("bio", form.bio);

      if (form.profileImage) {
        fd.append("profileImage", form.profileImage);
      }

      const res = await updateProfile(fd);

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...existingUser,
        ...res.user,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-updated"));

      alert("Profile Updated");
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="profile-container">
        <div className="profile-modal" style={{ margin: "0 auto" }}>
          <h3>Edit Profile</h3>

          <form className="profile-edit-form" onSubmit={handleSubmit}>
            {preview && <img src={preview} alt="" className="profile-avatar" />}

            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              required
            />

            <textarea
              name="bio"
              rows="4"
              value={form.bio}
              onChange={handleChange}
              placeholder="Bio"
            />

            <input type="file" accept="image/*" onChange={handleImage} />

            <div className="profile-modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
