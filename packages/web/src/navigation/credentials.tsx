
import { Box, Button } from "@material-ui/core"
import {
  Switch,
  Route,
  useRouteMatch,
  useHistory
} from "react-router-dom"

import { ClaimCredentialsForm, CredentialResponseForm, OfferCredentialsForm } from "../components"


export const CredentialsNavigation = () => {
  let { path } = useRouteMatch()
  const history = useHistory()
  
  /**
   * @PROCEED
   * @TODO Add possibility to store issued credentials.
   */

  return <Box>
    <Button fullWidth variant="contained" color="primary"
      onClick={() => history.push('/registry/credentials/own')}>Перейти в реестр</Button>
      
    <Switch>
      <Route path={`${path}/response`}>
        <CredentialResponseForm />
      </Route>
      <Route path={`${path}/claim`}>
        <ClaimCredentialsForm />
      </Route>
      <Route path={`${path}/offer`}>
        <OfferCredentialsForm />
      </Route>
    </Switch>
  </Box>
}