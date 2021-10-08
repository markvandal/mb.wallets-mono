
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom"

import { CapabilityClaimForm, CredentialRequestForm } from "../components"


export const CapabilityNavigation = () => {
  let { path } = useRouteMatch()

  return <Switch>
    <Route path={`${path}/claim`}>
      <CapabilityClaimForm />
    </Route>
    <Route path={`${path}/request`}>
      <CredentialRequestForm baseType="capability" />
    </Route>
  </Switch>
}