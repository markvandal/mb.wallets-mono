
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
import { capabilityHelper } from '../../model/capability'
import {
  PropsWithWallet,
  UnsignedFreeFormCredential
} from '../../model/types'
import { RootState } from '../../store/types'
import { passportHelper } from '../../model/passport'
import { credentialHelper } from '../../model/credential'
import { credentialActions } from '../../store'
import { bundle } from '../../model/bundler'
import { extractSubject } from '@owlmeans/regov-ssi-core'
import { CREDENTIAL_CAPABILITY_TYPE, CREDENTIAL_GOVERNANCE_TYPE } from '@owlmeans/regov-ssi-capability'


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
      create: async (fields: CapabilityClaimFields) => {
        if (!props.wallet) {
          return
        }
        const { identity } = passportHelper(props.wallet).getIdentity()
        if (!identity) {
          alert('Создайте в начале себе паспорт!')
          return
        }

        switch (fields.baseType) {
          case CREDENTIAL_CAPABILITY_TYPE:

            break
          case CREDENTIAL_GOVERNANCE_TYPE:
            switch (fields.source) {
              case 'self':
                if (!fields.name) {
                  alert('Пожалуйста укажите имя для самоподписанного сертификата организации')
                  return
                }
                const [wrap] = await capabilityHelper(props.wallet).selfIssueGovernance(fields.name)
                dispatch(credentialActions.selfSign(wrap.credential))
                alert('Вы успешно создали и добавили к себе самоподписанный сертификат организации')
                return
            }
            break
        }
        // dispatch(credentialActions.claim(claim))
      },
      copy: () => {
        dispatch(credentialActions.cleanUp())
      },
      ...props
    }
  }
)

export const CapabilityClaimForm = compose(withWallet, connector)(
  ({
    claim,
    create,
    created,
    wallet,
    copy
  }: PropsWithChildren<
    ConnectedProps<typeof connector> & PropsWithWallet
  >) => {
    const [fields, setFields] = useState<CapabilityClaimFields>({
      baseType: CREDENTIAL_CAPABILITY_TYPE,
      type: 'membership',
      source: 'self'
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
                    <InputLabel id="claim-capability-type-label">Тип возможности</InputLabel>
                    <Select
                      labelId="claim-capability-type-label"
                      value={fields.baseType}
                      label="Тип возможности"
                      onChange={event => setFields({
                        ...fields,
                        baseType: event.target.value as string
                      })}
                    >
                      <MenuItem value={CREDENTIAL_GOVERNANCE_TYPE}>Организация</MenuItem>
                      <MenuItem value={CREDENTIAL_CAPABILITY_TYPE}>Возможность</MenuItem>
                    </Select>

                  </FormControl>
                </Grid>
                <Grid item xs={8} container
                  direction="column"
                  justifyContent="flex-start"
                  alignItems="stretch">
                  {
                    fields.baseType === CREDENTIAL_CAPABILITY_TYPE
                    &&
                    <Grid item>
                      <FormControl fullWidth>
                        <InputLabel id="claim-capability-label">Возможность</InputLabel>
                        <Select
                          labelId="claim-capability-label"
                          value={fields.type}
                          label="Возможности"
                          onChange={event => setFields({
                            ...fields,
                            type: event.target.value as string
                          })}
                        >
                          <MenuItem value="membership">Принятие членов оргнанизации</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  }

                  {
                    fields.baseType === CREDENTIAL_GOVERNANCE_TYPE
                    && <Fragment>
                      <Grid item>
                        <FormControl fullWidth>
                          <InputLabel id="claim-source-label">Источник</InputLabel>
                          <Select
                            labelId="claim-source-label"
                            value={fields.source}
                            label="Самоподписанный"
                            onChange={event => setFields({
                              ...fields,
                              source: event.target.value as string
                            })}
                          >
                            <MenuItem value="self">Самоподписанный</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item>
                        <FormControl fullWidth>
                          <TextField
                            required
                            onChange={event => setFields({
                              ...fields,
                              name: event.target.value
                            })}
                            id="outlined-required"
                            label="Заголовок"
                            placeholder="Напр.: Управляющая организация"
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
                      Написать заявление
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
                    <pre>{
                      extractSubject<UnsignedFreeFormCredential>(claimCredential).data.freeform
                    }</pre>
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

type CapabilityClaimFields = {
  name?: string
  baseType?: string
  type?: string
  source?: string
}