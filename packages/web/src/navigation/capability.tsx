
import {
  Box,
  Button
} from "@material-ui/core"
import {
  Switch,
  Route,
  useRouteMatch,
  useHistory
} from "react-router-dom"

import {
  CapabilityClaimForm,
  CredentialRequestForm,
  CapabilityStoreForm
} from "../components"


export const CapabilityNavigation = () => {
  const history = useHistory()
  let { path } = useRouteMatch()

  return <Box>
    <Button fullWidth variant="contained" color="primary"
      onClick={() => history.push('/registry/credentials/own')}>Перейти в реестр</Button>
    <Switch>
      <Route path={`${path}/claim`}>
        <CapabilityClaimForm />
      </Route>
      <Route path={`${path}/request`}>
        <CredentialRequestForm baseType="capability" />
      </Route>
      <Route path={`${path}/store`}>
        <CapabilityStoreForm />
      </Route>
    </Switch>
  </Box>
}