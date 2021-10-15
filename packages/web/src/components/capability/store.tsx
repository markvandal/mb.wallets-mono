
import { PropsWithoutRef, useRef } from 'react'
import { compose } from 'recompose'

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  TextField,
} from '@material-ui/core'
import { connect, ConnectedProps } from 'react-redux'
import { withRouter, RouteComponentProps } from 'react-router'

import { capabilityHelper } from '../../model/capability'

import { PropsWithWallet } from '../../model/types'
import { withWallet } from '../../model/context'
import { bundle, unbundle } from '../../model/bundler'
import { buildFormHelper } from '../helper/form'
import { storeActions } from '../../store'


const connector = connect(
  (_, props: RouteComponentProps & PropsWithWallet) => {
    return {
      ...props
    }
  },
  (dispatch, props) => {
    return {
      store: async (fields: ImporterFields) => {
        if (!fields.document) {
          alert('Предоставьте документ!')
          return
        }
        try {
          const bundle = unbundle(fields.document)
          // @TODO We need to make system import issued documents for holder
          if (bundle.type !== 'offer') {
            alert('Добавить возможность можно только по предложению возможности!')
            return 
          }

          await capabilityHelper(props.wallet).storeOffer(bundle.document)
          
          dispatch(storeActions.update(await props.wallet.export()))

          alert('Возможность успешно добавлена в кошелёк!')

          props.history.push('/wallet')
        } catch(e) {
          console.log(e)
          alert('Неверный формат документа!')
        }
      },
      ...props
    }
  }
)

export const CapabilityStoreForm = compose(withWallet, withRouter, connector)(
  ({ store }: PropsWithoutRef<ConnectedProps<typeof connector>>) => {
    const helper = buildFormHelper<ImporterFields>([useRef()])

    return <Card>
      <CardHeader title="Предоставьте выписанную возможность" />
      <CardContent>
        <Grid container
          direction="column"
          justifyContent="flex-start"
          alignItems="stretch">
          <Grid item>
            <TextField
              {...helper.produce('document')} label="Документ для импорта"
              placeholder={bundle({ fake: 'value' }, 'offer')}
              helperText="Документ должен быть сгенерирован другим кошельком"
              multiline minRows={16} maxRows={32} fullWidth
              margin="normal" InputLabelProps={{ shrink: true }} variant="outlined"
            />
          </Grid>
          <Grid item container direction="row"
            justifyContent="flex-end"
            alignItems="flex-start">
            <Button variant="contained" size="large" color="primary"
              onClick={() => store(helper.extract())}>
              Добавить
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  }
)

type ImporterFields = {
  document: string
}
