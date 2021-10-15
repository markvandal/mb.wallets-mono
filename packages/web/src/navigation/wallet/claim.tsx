import { Box, Tab, Tabs } from "@material-ui/core"
import { Fragment } from "react"
import { Link, Route, Switch, useRouteMatch } from "react-router-dom"

import {
  IssuerCredentialSigner,
  IssuerCapabilitySigner
} from '../../components'

export const ClaimTabs = () => {
  let { url } = useRouteMatch<{ sub: string }>(['/wallet/claim/sign/:sub', '/wallet/claim/sign'])

  return <Fragment>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={url} indicatorColor="secondary">
        <Tab label="Документы" component={Link}
          value="/wallet/claim/sign" to="/wallet/claim/sign"
        />
        <Tab label="Возможности" component={Link}
          value="/wallet/claim/sign/capability" to="/wallet/claim/sign/capability"
        />
      </Tabs>
    </Box>
    <Switch>
      <Route path="/wallet/claim/sign" exact>
        <IssuerCredentialSigner />
      </Route>
      <Route path="/wallet/claim/sign/capability">
        <IssuerCapabilitySigner />
      </Route>
    </Switch>
  </Fragment>
}