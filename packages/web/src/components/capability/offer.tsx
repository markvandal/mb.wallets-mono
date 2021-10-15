
import { PropsWithoutRef, useRef } from 'react'
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
import { withRouter, RouteComponentProps } from 'react-router'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { PropsWithWallet } from '../../model/types'
import { withWallet } from '../../model/context'
import { bundle, unbundle } from '../../model/bundler'
import { buildFormHelper } from '../helper/form'
import { credentialActions } from '../../store'
import { RootState } from '../../store/types'
import { credentialHelper } from '../../model/credential'
import { ClaimBundleTypes, FreeFormClaimBundle, FreeFormOfferBundle } from '../../store/types/credential'
import { extractSubject } from '@owlmeans/regov-ssi-core'
import { capabilityHelper } from '../../model/capability'


const connector = connect(
  (
    { credential: { claim, signed } }: RootState,
    props: RouteComponentProps & PropsWithWallet & PropsWithoutRef<SignerProps>
  ) => {
    return {
      claim,
      signed,
      ...props
    }
  },
  (dispatch, props) => {
    return {
      unbundle: async (fields: SignerFields) => {
        if (!fields.document) {
          alert('Предоставьте документ!')
          return
        }
        try {
          const bundle = unbundle(fields.document)
          if (bundle.type !== 'claim') {
            alert('Выписать документ можно только по заявке!')
            return
          }

          dispatch(credentialActions.review(bundle.document))
        } catch (e) {
          console.log(e)
          alert('Неверный формат документа!')
        }
      },

      sign: async (claim: ClaimBundleTypes) => {
        if (!props.wallet || !claim) {
          return
        }

        try {
          const signed = await capabilityHelper(props.wallet).signClaim(
            JSON.parse(JSON.stringify(claim))
          )
          dispatch(credentialActions.sign(signed))
        } catch (e) {
          console.log(e)
          alert(e)
          return
        }
        
      },

      clear: () => {
        dispatch(credentialActions.cleanUp())

        // props.history.push('/wallet')
      },

      ...props
    }
  }
)

export const IssuerCapabilitySigner = compose(withWallet, withRouter, connector)(
  ({ claim, signed, unbundle, sign, clear, wallet }: PropsWithoutRef<ConnectedProps<typeof connector>>) => {
    const helper = buildFormHelper<SignerFields>([useRef()])
    const offer = credentialHelper(wallet).unbundleOffer(signed)
    const offerCapability = offer?.credentialSubject?.data.credential
    const claimed = credentialHelper(wallet).unbundleClaim(claim)
    const claimCapability = claimed?.credentialSubject?.data.credential

    return <Card>
      <CardHeader title="Выпишите возможность по заявке" />
      <CardContent>
        {
          (() => {
            switch (true) {
              case !!signed:
                return <Grid container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  <Grid item>
                    <Typography>Предоставляемая возможность</Typography>
                    <pre>{offerCapability 
                      ? JSON.stringify(extractSubject(offerCapability), undefined, 2)
                      : ''
                    }</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Документ</Typography>
                    <pre>{JSON.stringify(offerCapability, null, 2)}</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Сертификат документа</Typography>
                    <pre>{JSON.stringify(offer?.credentialSubject.did, null, 2)}</pre>
                  </Grid>
                  <Grid item container direction="row"
                    justifyContent="flex-end"
                    alignItems="flex-start">
                    <Grid item container direction="column"
                      justifyContent="flex-start"
                      alignItems="flex-end" xs={5} spacing={1}>
                      <Grid item>
                        <Typography variant="caption" color="secondary">Вы успешно подписали возможность!</Typography>
                      </Grid>
                      <Grid container item direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Grid item>
                          <Button variant="contained" size="large" color="secondary"
                            onClick={clear}>
                            Очистить
                          </Button>
                        </Grid>
                        <Grid item>
                          <CopyToClipboard text={
                            offer?.credentialSubject.did?.id ? bundle(signed, 'offer') : ''
                          }>
                            <Button variant="contained" size="large" color="primary">
                              Скопировать
                            </Button>
                          </CopyToClipboard>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              case !!claim:
                return <Grid container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  <Grid item>
                    <Typography>Возможность</Typography>
                    <pre>{
                      claimCapability
                        ? JSON.stringify(extractSubject(claimCapability), undefined, 2)
                        : ''
                    }</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Заявка на возможность</Typography>
                    <pre>{JSON.stringify(claimCapability, null, 2)}</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Заявка на сертификат для возможности</Typography>
                    <pre>{JSON.stringify(claimed?.credentialSubject.did, null, 2)}</pre>
                  </Grid>
                  <Grid item container direction="row"
                    justifyContent="flex-end"
                    alignItems="flex-start">
                    <Button variant="contained" size="large" color="primary"
                      onClick={() => sign(claim)}>
                      Подписать
                    </Button>
                  </Grid>
                </Grid>
              default:
                return <Grid container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  <Grid item>
                    <TextField
                      {...helper.produce('document')}
                      label="Заявка для рассмотрения" InputLabelProps={{ shrink: true }}
                      placeholder={bundle({ fake: 'value' }, 'claim')}
                      helperText="Заявка должна быть сгенерирована другим кошельком"
                      multiline minRows={16} maxRows={32} fullWidth margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item container direction="row"
                    justifyContent="flex-end"
                    alignItems="flex-start">
                    <Button variant="contained" size="large" color="primary"
                      onClick={() => unbundle(helper.extract())}>
                      Рассмотреть
                    </Button>
                  </Grid>
                </Grid>

            }
          })()
        }
      </CardContent>
    </Card>
  }
)

type SignerProps = {
  claim: FreeFormClaimBundle
  signed: FreeFormOfferBundle
}

type SignerFields = {
  document: string
}
