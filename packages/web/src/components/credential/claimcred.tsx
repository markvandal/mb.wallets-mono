
import { Fragment, PropsWithChildren, useState } from 'react'
import { compose } from 'recompose'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'

import { CopyToClipboard } from 'react-copy-to-clipboard'

import { withWallet } from '../../model/context'
import {
  PropsWithWallet,
} from '../../model/types'
import { RootState } from '../../store/types'
import { passportHelper } from '../../model/passport'
import { credentialHelper } from '../../model/credential'
import { credentialActions, storeActions } from '../../store'
import { bundle } from '../../model/bundler'
import {
  ClaimMembershipCredential,
  MembershipCredential,
  MembershipDoc,
  MembershipExt,
  MEMBERSHIP_CREDENTIAL_TYPE
} from '../../model/membership'
import {
  extractSubject
} from '@owlmeans/regov-ssi-core'
import { holderCredentialHelper } from '@owlmeans/regov-ssi-agent'


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
      create: async (fields: CredentialClaimFields) => {
        if (!props.wallet) {
          return
        }
        const { identity } = passportHelper(props.wallet).getIdentity()
        if (!identity) {
          alert('Создайте в начале себе паспорт!')
          return
        }

        switch (fields.type) {
          case MEMBERSHIP_CREDENTIAL_TYPE:
            if (!fields.role) {
              alert('Укажите обязательно название роли которую хотите получить')
              return
            }

            const claim = await holderCredentialHelper<
              MembershipDoc, MembershipExt, MembershipCredential
            >(props.wallet)
              .claim({
                type: MEMBERSHIP_CREDENTIAL_TYPE,
                crdContext: {
                  description: { '@id': 'scm:description', '@type': 'xsd:string' },
                  role: { '@id': 'scm:info', '@type': 'xsd:string' },
                  organization: { '@id': 'scm:info', '@type': 'xsd:string' },
                }
              }).build(
                {
                  role: fields.role,
                  description: fields.description
                }
              )

            const claimBundle = await holderCredentialHelper(props.wallet)
              .bundle<ClaimMembershipCredential>().build([claim])

            await holderCredentialHelper<
              MembershipDoc, MembershipExt, MembershipCredential
            >(props.wallet).claim({ type: fields.type }).register(claimBundle)

            dispatch(credentialActions.claim(claimBundle))
            dispatch(storeActions.tip())
            break
        }
        // dispatch(credentialActions.claim(claim))
      },
      copy: () => {
        alert('Заявка скопирована в буфер обмена')
        dispatch(credentialActions.cleanUp())
      },
      ...props
    }
  }
)

export const ClaimCredentialsForm = compose(withWallet, connector)(
  ({
    claim,
    create,
    created,
    wallet,
    copy
  }: PropsWithChildren<
    ConnectedProps<typeof connector> & PropsWithWallet
  >) => {
    const [fields, setFields] = useState<CredentialClaimFields>({
      type: MEMBERSHIP_CREDENTIAL_TYPE,
    })

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
              <Grid item container
                direction="row"
                justifyContent="space-between"
                alignItems="stretch"
                spacing={2}
              >
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel id="claim-credential-type-label">Тип документа</InputLabel>
                    <Select
                      labelId="claim-credential-type-label"
                      value={fields.type}
                      label="Тип документа"
                      onChange={event => setFields({
                        ...fields,
                        type: event.target.value as string
                      })}
                    >
                      <MenuItem value={MEMBERSHIP_CREDENTIAL_TYPE}>Членство в организации</MenuItem>
                    </Select>

                  </FormControl>
                </Grid>
                <Grid item xs={8} container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  {
                    fields.type === MEMBERSHIP_CREDENTIAL_TYPE
                    &&
                    <Fragment>
                      <Grid item>
                        <FormControl fullWidth>
                          <TextField
                            required
                            onChange={event => setFields({
                              ...fields,
                              role: event.target.value
                            })}
                            id="membership-role"
                            label="Роль"
                            placeholder="Напр.: Волонтёр"
                          />
                        </FormControl>
                      </Grid>
                      <Grid item>
                        <FormControl fullWidth>
                          <TextField
                            required
                            onChange={event => setFields({
                              ...fields,
                              description: event.target.value
                            })}
                            id="membership-description"
                            label="Описание"
                            placeholder="Напр.: Волонтёра можно просить помочь с любыми вопросами"
                          />
                        </FormControl>
                      </Grid>
                    </Fragment>
                  }
                </Grid>

                <Grid container
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={1}>
                  <Grid item xs={8}>
                    <Button fullWidth variant="contained" size="large"
                      disabled={!created && !wallet?.hasIdentity()}
                      onClick={() => create(fields)}>
                      Создать заявление
                    </Button>
                  </Grid>
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

type CredentialClaimFields = {
  type?: string
  role?: string
  description?: string
}