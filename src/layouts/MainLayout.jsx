import Navbar from "../components/Navbar";
import { BackButton } from "../components/BackButton";
import Sidebar from "../components/Sidebar";
import "../styles/layout.css";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <BackButton />
      <div className="layout">
        <Sidebar />
        <main className="feed">{children}</main>
      </div>
    </>
  );
}
