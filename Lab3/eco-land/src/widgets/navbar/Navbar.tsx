import { Logo } from "shared/ui/logo/Logo";
import { NavigationLink } from "shared/ui/navigationLink/navigationLink";
import styles from "./Navbar.module.scss";

export const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Logo label="EcoTech" />
      </div>
      <div className={styles.navigationMenu}>
        <NavigationLink to="/users" label="Users" />
        <NavigationLink to="/map" label="Map" />
        <NavigationLink to="/stations" label="Stations" />
        <NavigationLink to="/containers" label="Containers" />
        <NavigationLink to="/sensors" label="Sensors" />
        <NavigationLink to="/schedules" label="Schedules" />
        <NavigationLink to="/reports" label="Reports" />
      </div>
    </nav>
  );
};
