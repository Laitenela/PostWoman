import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import RequestPage from "../../components/pages/request";
import { routeLoader } from "../loaders/loaders";

const router = createBrowserRouter([
  {
    path: "",
    element: <App/>,
    loader: routeLoader.app,
    children: [
      {
          path: "/",
          element: <RequestPage/>,
          loader: routeLoader.soloRequest
      },
      {
        path: "/soloRequest/:id",
        element: <RequestPage />,
        loader: routeLoader.soloRequest
      }
    ]
  }
])

export default router;