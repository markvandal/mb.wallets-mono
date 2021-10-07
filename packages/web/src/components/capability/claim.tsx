
import { PropsWithChildren, useRef, useState } from 'react'
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
  UnsignedFreeFormCredential
} from '../../model/types'
import { buildFormHelper } from '../helper/form'
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
        if (!fields.name) {
          alert('Заполните пожалуйста документ, если хотите создать заявление!')
          return
        }

        const claim = await credentialHelper(props.wallet).createClaim(fields.name)
        dispatch(credentialActions.claim(claim))
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
    const helper = buildFormHelper<CapabilityClaimFields>([useRef()])

    const [baseType, setBaseType] = useState(CREDENTIAL_GOVERNANCE_TYPE)
    const [type, setType] = useState('tmp')

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
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel id="claim-capability-type-label">Тип возможности</InputLabel>
                    <Select
                      labelId="claim-capability-type-label"
                      value={baseType}
                      label="Тип возможности"
                      onChange={event => setBaseType(event.target.value as string)}
                    >
                      <MenuItem value={CREDENTIAL_GOVERNANCE_TYPE}>Организация</MenuItem>
                      <MenuItem value={CREDENTIAL_CAPABILITY_TYPE}>Возможность</MenuItem>
                    </Select>

                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  {
                    baseType === CREDENTIAL_CAPABILITY_TYPE
                    && <FormControl fullWidth>
                      <InputLabel id="claim-capability-label">Возможность</InputLabel>
                      <Select
                        labelId="claim-capability-label"
                        value={type}
                        label="Возможности"
                        onChange={event => setType(event.target.value as string)}
                      >
                        <MenuItem value="tmp">Принятие членов оргнанизации</MenuItem>
                      </Select>
                    </FormControl>
                  }
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
  name: string
}