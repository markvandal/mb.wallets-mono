
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom"

import { Box, makeStyles } from '@material-ui/core'

import { NavigationMainRedirect, NavigationTop } from '../components'

import { StoreNavigation } from "./store"
import { WalletNavigation } from "./wallet"
import { RegistryNavigation } from "./registry"
import { CapabilityNavigation } from "./capability"


export const RootNavigation = () => {
  const classes = useStyles()

  return <Router>
    <Box>
      <NavigationTop />
      <Box className={classes.content}>
        <Switch>
          <Route exact path="/">
            <NavigationMainRedirect />
          </Route>
          <Route path="/store">
            <StoreNavigation />
          </Route>
          <Route path="/wallet">
            <WalletNavigation />
          </Route>
          <Route path="/registry">
            <RegistryNavigation />
          </Route>
          <Route path="/capability">
            <CapabilityNavigation />
          </Route>
        </Switch>
      </Box>
    </Box>
  </Router>
}

const useStyles = makeStyles({
  content: {
    paddingTop: '10%',
  },
})