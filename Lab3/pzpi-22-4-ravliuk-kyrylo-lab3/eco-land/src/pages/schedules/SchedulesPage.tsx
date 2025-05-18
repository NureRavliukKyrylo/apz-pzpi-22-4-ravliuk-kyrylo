import UsersLayout from "shared/layouts/users/UsersLayout";
import { NavigationMenuSchedules } from "widgets/navigationManage/schedules/NavigationMenuSchedules";
import { Navbar } from "widgets/navbar/Navbar";

const SchedulesPage = () => {
  return (
    <>
      <Navbar />
      <UsersLayout>
        <NavigationMenuSchedules />
      </UsersLayout>
    </>
  );
};

export default SchedulesPage;
