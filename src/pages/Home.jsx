import MainLayout from "../layouts/MainLayout";
import Feed from "../components/Feed";
import HomeBackground from "../components/HomeBackground";

export default function Home() {
  return (
    <div className="home-with-background">
      <HomeBackground />
      <div className="home-content-layer">
        <MainLayout>
          <Feed />
        </MainLayout>
      </div>
    </div>
  );
}
