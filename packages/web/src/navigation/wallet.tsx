import { PropsWithChildren } from "react"

import {
  Switch,
  Route,
  useRouteMatch,
  useHistory,
} from "react-router-dom"

import { Button, Grid } from '@material-ui/core'
import {
  WalletCredentialImporter,
  WalletCredentialBundler,
  WalletPassport,
  CredentialClaim,
  CredentialVerifier,
} from "../components"
import {
  ClaimTabs
} from './wallet/claim'
import { PropsWithWallet } from "../model/types"
import { RootState } from "../store/types"
import { connect, ConnectedProps } from "react-redux"
import { compose } from "@reduxjs/toolkit"
import { withWallet } from "../model/context"
import { REGISTRY_SECTION_OWN, REGISTRY_TYPE_CREDENTIALS } from "@owlmeans/regov-ssi-core"


const connector = connect(
  ({
    identity: { created }
  }: RootState, props: PropsWithWallet) => {
    return {
      created,
      ...props
    }
  }
)

export const WalletNavigation = compose(withWallet, connector)(
  ({ created, wallet }: PropsWithChildren<
    ConnectedProps<typeof connector> & PropsWithWallet
  >) => {
    let { path } = useRouteMatch()
    const history = useHistory()

    return <Switch>
      <Route exact path={`${path}`}>
        <Grid container direction="row" justifyContent="space-between" alignItems="stretch"
          spacing={1}>
          <Grid container item xs={6} direction="column" justifyContent="flex-start" alignItems="stretch"
            spacing={1}>
            <Grid item>
              {created || wallet?.hasIdentity() ? <CredentialClaim /> : null}
            </Grid>
            <Grid item>
              <Button fullWidth variant="contained" color="primary"
                onClick={
                  () => history.push(`/registry/${REGISTRY_TYPE_CREDENTIALS}/${REGISTRY_SECTION_OWN}`)
                }>Сохраненные документы</Button>
            </Grid>
          </Grid>
          <Grid container item xs={6} spacing={1}
            direction="column" justifyContent="flex-start" alignItems="stretch">
            <Grid item>
              <WalletPassport />
            </Grid>
            <Grid container item spacing={2}
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch">
              <Grid item>
                <Button fullWidth variant="contained" color="primary"
                  disabled={true}
                  onClick={() => history.push(`${path}/claim/sign`)}>Выписать документ по заявке (недоступно)</Button>
              </Grid>
              <Grid item>
                <Button fullWidth variant="contained" color="primary"
                  onClick={() => history.push(`${path}/import/peer`)}>Добавить доверенное лицо</Button>
              </Grid>
              <Grid item>
                <Button fullWidth variant="contained" color="primary"
                  disabled={true}
                  onClick={() => history.push(`${path}/verify`)}>Проверить документ (недоступно)</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Route>
      <Route path={`${path}/export/:type/:credential`}>
        <WalletCredentialBundler />
      </Route>
      <Route path={`${path}/import/:section`}>
        <WalletCredentialImporter />
      </Route>
      <Route path={`${path}/claim/sign`}>
        <ClaimTabs />
      </Route>
      <Route path={`${path}/verify`}>
        <CredentialVerifier />
      </Route>
    </Switch>
  }
)

