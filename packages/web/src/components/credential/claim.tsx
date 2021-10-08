
import { PropsWithChildren, useRef } from 'react'
import { compose } from 'recompose'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  TextField,
  Typography,
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'

import { CopyToClipboard } from 'react-copy-to-clipboard'

import { withWallet } from '../../model/context'
import {
  PropsWithWallet,
} from '../../model/types'
import { buildFormHelper } from '../helper/form'
import { RootState } from '../../store/types'
import { passportHelper } from '../../model/passport'
import { credentialHelper } from '../../model/credential'
import { credentialActions, storeActions } from '../../store'
import { bundle } from '../../model/bundler'
import { extractSubject } from '@owlmeans/regov-ssi-core'


const connector = connect(
  ({
    credential: { currentClaim },
    identity: { created }
  }: RootState, props: PropsWithWallet) => {
    return {
      created,
      claim: currentClaim,
      ...props
    }
  },
  (dispatch, props: PropsWithWallet) => {
    return {
      create: async (fields: ClaimFields) => {
        if (!props.wallet) {
          return
        }
        const { identity } = passportHelper(props.wallet).getIdentity()
        if (!identity) {
          alert('Создайте в начале себе паспорт!')
          return
        }
        if (!fields.freeform) {
          alert('Заполните пожалуйста документ, если хотите создать заявление!')
          return
        }

        const claim = await credentialHelper(props.wallet).createClaim(fields.freeform)
        dispatch(credentialActions.claim(claim))
        dispatch(storeActions.update(await props.wallet.export()))
      },
      copy: () => {
        dispatch(credentialActions.cleanUp())
      },
      ...props
    }
  }
)

export const CredentialClaim = compose(withWallet, connector)(
  ({
    claim,
    create,
    created,
    wallet,
    copy
  }: PropsWithChildren<
    ConnectedProps<typeof connector> & PropsWithWallet
  >) => {
    const helper = buildFormHelper<ClaimFields>([useRef()])

    const claimCredential = claim && credentialHelper(wallet).unbundleClaim(claim)
      .credentialSubject?.data.credential

    return <Grid container
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={2}>
      <Grid item>
        <Card>
          <CardHeader title="Создать заявление на документ" />
          <CardContent>
            <Grid container
              direction="column"
              justifyContent="center"
              alignItems="stretch">
              <Grid item>
                <Typography variant="body2">
                  Чтобы получить верифицированный документ, создайте заявление.
                  Скопируйте и передайте это заявление эмитенту документов,
                  которому доверяют лица запрашивающие документ для проверки.<br />
                  Например, передйте представителю "Паспортного стола Meta-ID"
                </Typography>
              </Grid>
              <Grid item>
                <TextField
                  {...helper.produce('freeform')}
                  label="Документ в свободной форме"
                  placeholder="Например: Петра Пустота, под ником @voyd в Телеграмме, явялется членом сообщества Meta-Belarus"
                  helperText="Заполните содержание документа в свободной форме."
                  multiline
                  minRows={3}
                  maxRows={10}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid container
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={1}>
                <Grid item xs={6}>
                  <Button fullWidth variant="contained" size="large"
                    disabled={!created && !wallet?.hasIdentity()}
                    onClick={() => create(helper.extract())}>
                    Создать
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {
        claimCredential ? <Grid item>
          <Card>
            <CardHeader title="Заявление успешно создано!" />
            <CardContent>
              <Grid container
                direction="column"
                justifyContent="center"
                alignItems="stretch">
                <Grid item>
                  <Typography variant="h6">Текст документа</Typography>
                  <Typography variant="caption">
                    <pre>{JSON.stringify(extractSubject(claimCredential), undefined, 2)}</pre>
                  </Typography>
                </Grid>
                <Grid container
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={1}>
                  <Grid item xs={6}>
                    <CopyToClipboard text={bundle(claim, 'claim')} onCopy={copy}>
                      <Button fullWidth variant="contained" color="primary">
                        Скопировать
                      </Button>
                    </CopyToClipboard>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
          : null
      }
    </Grid>
  }
)

type ClaimFields = {
  freeform: string
}