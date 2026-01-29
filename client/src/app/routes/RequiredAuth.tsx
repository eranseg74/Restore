import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserInfoQuery } from "../../features/account/accountApi";

export default function RequiredAuth() {
  const { data: user, isLoading } = useUserInfoQuery();
  const location = useLocation(); // Used to redirect the user back from the URL he came from. The location object represents where the app is currently.

  if (isLoading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to='/login' state={{ from: location }} />; // Redirect to login if not authenticated. The Navigate component is from react-router-dom and is used to navigate programmatically. The state prop is used to pass the current location so that the user can be redirected back after login.
  }

  const adminRoutes = ["/inventory", "/admin-dashboard"];

  // Specifying that the relative URLs in the adminRoutes array require admin privilliges
  if (
    adminRoutes.includes(location.pathname) &&
    !user.roles.includes("Admin")
  ) {
    return <Navigate to='/' replace />;
  }

  return <Outlet />; // Render the child routes if authenticated. The child route in this case would be the protected route that requires authentication.
}
