import UsersLayout from "shared/layouts/users/UsersLayout";
import { NavigationMenuSensors } from "widgets/navigationManage/sensors/NavigationMenuSensors";
import { Navbar } from "widgets/navbar/Navbar";

const SensorsPage = () => {
  return (
    <>
      <Navbar />
      <UsersLayout>
        <NavigationMenuSensors />
      </UsersLayout>
    </>
  );
};

export default SensorsPage;
