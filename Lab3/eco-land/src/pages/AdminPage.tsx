import { authApi } from "features/auth/api/authApi";

const AdminPage = () => {
  const handleClick = async () => {
    try {
      const name = await authApi.myself();
      console.log("User name from /myself:", name);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  return (
    <h1 onClick={handleClick} style={{ cursor: "pointer" }}>
      Hello
    </h1>
  );
};

export default AdminPage;
