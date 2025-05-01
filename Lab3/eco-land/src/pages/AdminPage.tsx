import UsersLayout from "shared/layouts/users/UsersLayout";
import { NavigationMenuAdmin } from "widgets/navigationManage/adminMenu/AdminNavigationMenu";
import { Navbar } from "widgets/navbar/Navbar";

const AdminPage = () => {
  return (
    <>
      <Navbar />
      <UsersLayout>
        <NavigationMenuAdmin />
      </UsersLayout>
    </>
  );
};

export default AdminPage;
