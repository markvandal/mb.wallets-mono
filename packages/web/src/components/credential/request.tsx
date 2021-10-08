
import { PropsWithChildren, useState } from 'react'
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
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'

import { CopyToClipboard } from 'react-copy-to-clipboard'

import { withWallet } from '../../model/context'
import {
  PropsWithWallet,
  TYPE_CREDENTIAL_FREEFORM,
} from '../../model/types'
import { RootState } from '../../store/types'
import { passportHelper } from '../../model/passport'
import { credentialHelper } from '../../model/credential'
import { credentialActions, storeActions } from '../../store'
import { bundle } from '../../model/bundler'
import { CREDENTIAL_GOVERNANCE_TYPE, REGISTRY_TYPE_CAPABILITY } from '@owlmeans/regov-ssi-capability'


const connector = connect(
  ({
    credential: { requested },
    identity: { created }
  }: RootState, props: PropsWithWallet & CredentialRequestProps) => {
    return {
      created,
      requested,
      ...props
    }
  },
  (dispatch, props: PropsWithWallet & CredentialRequestProps) => {
    return {
      create: async (fields: CredentialRequestFields) => {
        if (!props.wallet) {
          return
        }
        const { identity } = passportHelper(props.wallet).getIdentity()
        if (!identity) {
          alert('Создайте в начале себе паспорт!')
          return
        }
        switch (props.baseType) {
          case 'capability':
            try {
            const bundle = await credentialHelper(props.wallet)
              .request(fields.type, REGISTRY_TYPE_CAPABILITY, false)
              dispatch(credentialActions.request(bundle))
              dispatch(storeActions.tip())
            } catch (e) {
              console.log(e)
              alert('Произошла ошибка')
            }
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

export const CredentialRequestForm = compose(withWallet, connector)(
  ({
    requested,
    create,
    created,
    wallet,
    baseType,
    copy
  }: PropsWithChildren<
    ConnectedProps<typeof connector> & PropsWithWallet
  >) => {
    const formTitle = baseType === 'capability'
      ? 'возможности' : 'документа'

    const [fields, setFields] = useState<CredentialRequestFields>({
      type: baseType === 'capability'
        ? CREDENTIAL_GOVERNANCE_TYPE : TYPE_CREDENTIAL_FREEFORM,
    })

    const types = baseType === 'capability'
      ? [
        CREDENTIAL_GOVERNANCE_TYPE,
      ] : [
        TYPE_CREDENTIAL_FREEFORM
      ]

    const labels = {
      [CREDENTIAL_GOVERNANCE_TYPE]: 'Самоподписанный сертификат организации',
      [TYPE_CREDENTIAL_FREEFORM]: 'Документы в свободной форме'
    }

    return <Grid container
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={2}>
      <Grid item>
        <Card>
          <CardHeader title={`Создать запрос ${formTitle}`} />
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
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="credential-type-label">Тип документа</InputLabel>
                    <Select
                      labelId="credential-type-label"
                      value={fields.type}
                      label="Тип возможности"
                      onChange={event => setFields({
                        ...fields,
                        type: event.target.value as string
                      })}
                    >
                      {types.map(type => <MenuItem key={type} value={type}>{labels[type]}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                

                <Grid container
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={1}>
                  <Grid item xs={6}>
                    <Button fullWidth variant="contained" size="large"
                      disabled={!created && !wallet?.hasIdentity()}
                      onClick={() => create(fields)}>
                      Создать запрос
                    </Button>
                  </Grid>
                </Grid>
              </Grid>

            </Grid>
          </CardContent>
        </Card>
      </Grid>
      {
        requested ? <Grid item>
          <Card>
            <CardHeader title="Запрос успешно создан!" />
            <CardContent>
              <Grid container
                direction="column"
                justifyContent="center"
                alignItems="stretch">
                <Grid item>
                  <Typography variant="h6">Текст документа</Typography>
                  <Typography variant="caption">
                    <pre>{
                      JSON.stringify(requested, undefined, 2)
                    }</pre>
                  </Typography>
                </Grid>
                <Grid container
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={1}>
                  <Grid item xs={6}>
                    <CopyToClipboard text={bundle(requested, 'request')} onCopy={copy}>
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

type CredentialRequestFields = {
  type?: string
}

type CredentialRequestProps = {
  baseType?: string
}