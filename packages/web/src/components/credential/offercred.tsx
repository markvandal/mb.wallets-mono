
import { PropsWithoutRef, useState } from 'react'
import { compose } from 'recompose'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { PropsWithWallet } from '../../model/types'
import { withWallet } from '../../model/context'
import { bundle, unbundle } from '../../model/bundler'
import { credentialActions } from '../../store'
import { RootState } from '../../store/types'
import { credentialHelper } from '../../model/credential'
import { ClaimBundleTypes, ClaimTypes, MembershipClaimBundle, MembershipOfferBundle } from '../../store/types/credential'
import { extractSubject, REGISTRY_SECTION_OWN } from '@owlmeans/regov-ssi-core'
import { REGISTRY_TYPE_CAPABILITY } from '@owlmeans/regov-ssi-capability'
import { ClaimMembershipCredential, MembershipCapability, MembershipCredential, MEMBERSHIP_CAPABILITY_TYPE, MEMBERSHIP_CREDENTIAL_TYPE } from '../../model/membership'
import { CREDENTIAL_CLAIM_TYPE } from '@owlmeans/regov-ssi-agent'


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

      sign: async (fields: SignerFields, claim: ClaimBundleTypes) => {
        if (!props.wallet || !claim) {
          return
        }

        const claimCred = (claim.verifiableCredential as ClaimTypes[]).find(
          cred => cred.type.includes(MEMBERSHIP_CREDENTIAL_TYPE)
        ) as ClaimMembershipCredential

        

        if (claimCred) {
        /**
         * @PROCEED - we need to put the organization name someway into 
         * the credential. It looks like there are some discrapancy between
         * between actual claim and the necessity to sign it with a specific 
         * capability. 
         */

          claimCred.credentialSubject.data.credential.credentialSubject.organization
            = fields.capability
        }

        const signed = await credentialHelper(props.wallet).signClaim(
          JSON.parse(JSON.stringify(claim))
        )

        dispatch(credentialActions.sign(signed))
      },

      clear: () => {
        dispatch(credentialActions.cleanUp())

        // props.history.push('/wallet')
      },

      ...props
    }
  }
)

export const OfferCredentialsForm = compose(withWallet, withRouter, connector)(
  ({ claim, signed, unbundle, sign, clear, wallet }: PropsWithoutRef<ConnectedProps<typeof connector>>) => {
    const [fields, setFields] = useState<SignerFields>({})
    const offer = credentialHelper(wallet).unbundleOffer(signed)
    const offerCredential = offer?.credentialSubject?.data.credential
    const claimed = credentialHelper(wallet).unbundleClaim(claim)
    const claimCredential = claimed?.credentialSubject?.data.credential

    return <Card>
      <CardHeader title="Выпишите удостоверение члена организации по заявке" />
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
                    <Typography>Документ</Typography>
                    <pre>{offerCredential ? JSON.stringify(extractSubject(offerCredential), null, 2) : ''}</pre>
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
                        <Typography variant="caption" color="secondary">Вы успешно подписали документ!</Typography>
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
                            offer?.credentialSubject.did?.id ? bundle(signed, 'credential') : ''
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
                const capabilities = wallet.getRegistry(REGISTRY_TYPE_CAPABILITY)
                  .registry.credentials[REGISTRY_SECTION_OWN].filter(
                    cap => cap.credential.type.includes(MEMBERSHIP_CAPABILITY_TYPE)
                  ).map(cap => cap.credential) as MembershipCapability[]

                return <Grid container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  <Grid item>
                    <Typography>Документ</Typography>
                    <pre>{
                      claimCredential
                        ? JSON.stringify(extractSubject(claimCredential), undefined, 2)
                        : ''
                    }</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Заявка на документ</Typography>
                    <pre>{JSON.stringify(claimCredential, null, 2)}</pre>
                  </Grid>
                  <Grid item>
                    <Typography>Заявка на сертификат для документа</Typography>
                    <pre>{JSON.stringify(claimed?.credentialSubject.did, null, 2)}</pre>
                  </Grid>
                  <Grid item>
                    <FormControl fullWidth>
                      <InputLabel id="claim-capability-label">Право принимать членов</InputLabel>
                      <Select
                        labelId="membership-capability-label"
                        value={fields.capability}
                        label="Выберите возможность"
                        onChange={
                          event => setFields({
                            ...fields,
                            capability: event.target.value as string
                          })
                        }
                      >
                        {
                          capabilities.map(
                            cap => {
                              return <MenuItem key={cap.id} value={cap.id}>
                                {cap.credentialSubject.data.subjectProps.extension.organization}
                              </MenuItem>
                            }
                          )
                        }
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item container direction="row"
                    justifyContent="flex-end"
                    alignItems="flex-start">
                    <Button variant="contained" size="large" color="primary"
                      onClick={() => sign(fields, claim)}>
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
                      id="document"
                      onChange={
                        event => setFields({ ...fields, document: event.target.value })
                      }
                      label="Заявка для рассмотрения"
                      placeholder={bundle({ fake: 'value' }, 'claim')}
                      helperText="Заявка должна быть сгенерирована другим кошельком"
                      multiline
                      minRows={16}
                      maxRows={32}
                      fullWidth
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item container direction="row"
                    justifyContent="flex-end"
                    alignItems="flex-start">
                    <Button variant="contained" size="large" color="primary"
                      onClick={() => unbundle(fields)}>
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
  claim: MembershipClaimBundle
  signed: MembershipOfferBundle
}

type SignerFields = {
  document?: string
  capability?: string
}