import { createHashRouter } from "react-router-dom";
import App from "../../App";
import RequestPage from "../../components/pages/request";
import { routeLoader } from "../loaders/loaders";
import Snippets from "../../components/pages/snippets";
import Chain from "../../components/pages/chain";

const router = createHashRouter([
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
      },
      {
        path: "/snippets",
        element: <Snippets />,
        loader: routeLoader.snippets
      },
      {
        path: "/chain",
        element: <Chain/>,
        loader: routeLoader.chain
      },
      {
        path: "/chain/:id",
        element: <Chain/>,
        loader: routeLoader.chain
      }
    ]
  }
])

export default router;