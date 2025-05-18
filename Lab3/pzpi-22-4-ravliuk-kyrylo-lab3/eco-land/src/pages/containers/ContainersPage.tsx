import UsersLayout from "shared/layouts/users/UsersLayout";
import { NavigationMenuContainers } from "widgets/navigationManage/containers/NavigationMenuContainers";
import { Navbar } from "widgets/navbar/Navbar";

const ContainersPage = () => {
  return (
    <>
      <Navbar />
      <UsersLayout>
        <NavigationMenuContainers />
      </UsersLayout>
    </>
  );
};

export default ContainersPage;
