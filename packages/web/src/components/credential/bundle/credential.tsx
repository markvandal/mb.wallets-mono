
import { PropsWithoutRef } from 'react'
import { compose } from 'recompose'

import {
  Card,
  CardHeader,
  CardContent,
  Paper,
  Typography,
  Grid,
  Button,
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'

import { CopyToClipboard } from 'react-copy-to-clipboard'

import { Credential } from 'metabelarusid-core'

import { PropsWithWallet } from '../../../model/types'
import { passportHelper } from '../../../model/passport'
import { withWallet } from '../../../model/context'
import { bundle } from '../../../model/bundler'
import { DIDDocument } from 'metabelarusid-did'


type WalletCredentialBundlerRouteParams = {
  type: string
  credential: string
} & { [k: string]: string }

const connector = connect(
  (_, props: RouteComponentProps<WalletCredentialBundlerRouteParams> & PropsWithWallet) => {
    const type = props.match.params.type
    const id = props.match.params.credential

    const credential: {
      credential?: Credential,
      did?: DIDDocument
    } = {}

    if (props.wallet) {
      if (id === 'passport') {
        const passport = passportHelper.getPassport(props.wallet)
        console.log(passport)
        credential.credential = passport.identity
        credential.did = passport.did.did
      } else {
        const received = props.wallet.getRegistry(type).getCredential(id)
        credential.credential = received.credential
        credential.did = props.wallet.did.registry.personal.dids.find(
          did => received.credential.id === did.did.id
        ).did
      }
    }

    return {
      credential,
      ...props
    }
  },
  (_, props) => {
    return {
      ...props
    }
  }
)

export const WalletCredentialBundler = compose(withWallet, withRouter, connector)(
  ({
    credential,
    match
  }: PropsWithoutRef<
    ConnectedProps<typeof connector> & PropsWithWallet & RouteComponentProps
  >) => {
    return <Card>
      <CardHeader title={`Документ для представления`}
        subheader={credential.credential?.id} />
      <CardContent>
        <Grid container spacing={3}>
          <Grid container item
            direction="column"
            justifyContent="flex-start"
            alignItems="stretch"
            spacing={2}>
            <Grid item>
              <CopyToClipboard text={
                credential.credential?.id ? bundle(credential, match.params.type) : ''
              }>
                <Button fullWidth variant="contained" color="primary"
                  disabled={!credential.credential?.id}>
                  Скопировать
                </Button>
              </CopyToClipboard>
            </Grid>
            <Grid item>
              <CopyToClipboard text={
                credential.credential?.id ? bundle(credential.did, 'certificate') : ''
              }>
                <Button fullWidth variant="contained"
                  disabled={!credential.credential?.id}>
                  Скопировать только сертификат
                </Button>
              </CopyToClipboard>
            </Grid>
          </Grid>
          <Grid container item direction="column"
            justifyContent="flex-start"
            alignItems="stretch">
            <Grid item>
              <Typography variant="h5">Документ</Typography>
              <Paper>
                <Typography variant="caption">
                  <pre>
                    {JSON.stringify(credential.credential, null, 2)}
                  </pre>
                </Typography>
              </Paper>
            </Grid>
            <Grid item>
              <Typography variant="h5">Сертификат для документа</Typography>
              <Paper>
                <Typography variant="caption">
                  <pre>
                    {JSON.stringify(credential.did, null, 2)}
                  </pre>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  }
)

