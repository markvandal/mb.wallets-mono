
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom"

import { CredentialResponseForm } from "../components"


export const CredentialsNavigation = () => {
  let { path } = useRouteMatch()

  return <Switch>
    <Route path={`${path}/response`}>
      <CredentialResponseForm />
    </Route>
  </Switch>
}