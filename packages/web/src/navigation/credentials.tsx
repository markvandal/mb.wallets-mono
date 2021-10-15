
import { Box, Button } from "@material-ui/core"
import {
  Switch,
  Route,
  useRouteMatch,
  useHistory
} from "react-router-dom"

import { CredentialResponseForm } from "../components"


export const CredentialsNavigation = () => {
  let { path } = useRouteMatch()
  const history = useHistory()

  return <Box>
    <Button fullWidth variant="contained" color="primary"
      onClick={() => history.push('/registry/credentials/own')}>Перейти в реестр</Button>
      
    <Switch>
      <Route path={`${path}/response`}>
        <CredentialResponseForm />
      </Route>
    </Switch>
  </Box>
}