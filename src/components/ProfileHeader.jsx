export default function ProfileHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="profile-header">
      <img
        src="https://ui-avatars.com/api/?name=User"
        alt=""
        className="profile-avatar"
      />
      <div>
        <h1>{user?.username || "User"}</h1>
        <p>{user?.email || "No email"}</p>
        <p className="bio">No bio yet...</p>
        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
}
