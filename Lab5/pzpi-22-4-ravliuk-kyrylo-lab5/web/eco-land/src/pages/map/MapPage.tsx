import UsersLayout from "shared/layouts/users/UsersLayout";
import MapWidget from "widgets/map/MapWidget";
import { Navbar } from "widgets/navbar/Navbar";

const MapPage = () => {
  return (
    <>
      <Navbar />
      <UsersLayout>
        <MapWidget />
      </UsersLayout>
    </>
  );
};

export default MapPage;
