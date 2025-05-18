import UsersLayout from "shared/layouts/users/UsersLayout";
import { NavigationMenu } from "widgets/navigationManage/stations/NavigationMenu";
import { Navbar } from "widgets/navbar/Navbar";

const UsersPage = () => {
  return (
    <>
      <Navbar />
      <UsersLayout>
        <NavigationMenu />
      </UsersLayout>
    </>
  );
};

export default UsersPage;
