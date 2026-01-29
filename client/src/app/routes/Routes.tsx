import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../layout/App";
import HomePage from "../../features/home/HomePage";
import Catalog from "../../features/catalog/Catalog";
import ProductDetails from "../../features/catalog/ProductDetails";
import AboutPage from "../../features/about/AboutPage";
import ContactPage from "../../features/contact/ContactPage";
import ServerError from "../errors/ServerError";
import NotFound from "../errors/NotFound";
import BasketPage from "../../features/basket/BasketPage";
import CheckoutPage from "../../features/checkout/CheckoutPage";
import LoginForm from "../../features/account/LoginForm";
import RegisterForm from "../../features/account/RegisterForm";
import RequiredAuth from "./RequiredAuth";
import CheckoutSuccess from "../../features/checkout/CheckoutSuccess";
import OrdersPage from "../../features/orders/OrdersPage";
import OrderDetailedPage from "../../features/orders/OrderDetailedPage";
import InventoryPage from "../../features/admin/InventoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Protecting the checkout route with RequiredAuth component. If the user is not authenticated, they will be redirected to the login page.
      // In the RequiredAuth component, we check if the user is authenticated. If not, we redirect them to the login page. If they are authenticated, we render the Outlet component which will render the child routes (in this case, the checkout route) using the Outlet.
      // Every time we want to protect a route, we can wrap it in the RequiredAuth component like this.
      {
        element: <RequiredAuth />,
        children: [
          { path: "checkout", element: <CheckoutPage /> },
          { path: "checkout/success", element: <CheckoutSuccess /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "orders/:id", element: <OrderDetailedPage /> },
          { path: "inventory", element: <InventoryPage /> },
        ],
      },
      { path: "", element: <HomePage /> },
      { path: "catalog", element: <Catalog /> },
      { path: "catalog/:id", element: <ProductDetails /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "basket", element: <BasketPage /> },
      { path: "server-error", element: <ServerError /> },
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <RegisterForm /> },
      { path: "not-found", element: <NotFound /> },
      // The Navigate is a component provided by react-router-dom for navigation. The replace will replace the bad link we are seraching with the not found component and will redirect the user to that component
      { path: "*", element: <Navigate replace to='/not-found' /> },
    ],
  },
]);
