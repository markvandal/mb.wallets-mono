
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom"

import { CapabilityClaimForm } from "../components"


export const CapabilityNavigation = () => {
  let { path } = useRouteMatch()

  return <Switch>
    <Route path={`${path}/claim`}>
      <CapabilityClaimForm />
    </Route>
  </Switch>
}