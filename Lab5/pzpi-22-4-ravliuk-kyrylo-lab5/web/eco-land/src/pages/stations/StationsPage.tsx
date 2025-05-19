import UsersLayout from "shared/layouts/users/UsersLayout";
import { NavigationMenuStations } from "widgets/navigationManage/stations/NavigationMenuStations";
import { Navbar } from "widgets/navbar/Navbar";

const StationsPage = () => {
  return (
    <>
      <Navbar />
      <UsersLayout>
        <NavigationMenuStations />
      </UsersLayout>
    </>
  );
};

export default StationsPage;
