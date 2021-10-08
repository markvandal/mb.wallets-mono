
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
import { credentialHelper } from '../../model/credential'
import { RootState } from '../../store/types'


const connector = connect(
  (
    { credential: { response, requested } }: RootState,
    props: RouteComponentProps & PropsWithWallet
  ) => {
    return {
      requested,
      responded: response,
      ...props
    }
  },
  (dispatch, props) => {
    return {
      read: async (fields: RequestFields) => {
        if (!fields.request) {
          alert('Предоставьте документ!')
          return
        }
        const bundle = unbundle(fields.request)

        dispatch(credentialActions.request(bundle.document))
      },
      response: async (fields: RequestFields) => {
        if (!fields.request) {
          alert('Предоставьте документ!')
          return
        }
        try {
          const bundle = unbundle(fields.request)

          const response = await credentialHelper(props.wallet).response(bundle.document)

          dispatch(credentialActions.response(response))
        } catch (e) {
          console.log(e)
          alert('Неверный формат документа!')
        }
      },
      copy: () => {
        dispatch(credentialActions.cleanUp())
      },
      ...props
    }
  }
)

export const CredentialResponseForm = compose(withWallet, withRouter, connector)(
  ({ response, requested, responded, copy, read }: PropsWithoutRef<ConnectedProps<typeof connector>>) => {
    const helper = buildFormHelper<RequestFields>([useRef()])

    return <Grid container
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={2}>
      <Grid item>

        <Card>
          <CardHeader title="Разобрать запрос документа" />
          <CardContent>
            <Grid container
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch">
              <Grid item>
                <TextField
                  {...helper.produce('request')}
                  label="Запроса документа"
                  placeholder={bundle({ fake: 'value' }, 'sometype')}
                  helperText="Запрос должен быть сгенерирован другим кошельком"
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
                  onClick={() => read(helper.extract())}>
                  Прочитать запрос
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {
        !responded && requested
        && <Grid item>
          <Card>
            <CardHeader title="Загруженный запрос" />
            <CardContent>
              <Grid container
                direction="column"
                justifyContent="center"
                alignItems="stretch">
                <Grid item>
                  <Typography variant="h6">Документ запроса</Typography>
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
                    <Button fullWidth variant="contained" color="primary"
                      onClick={() => response(helper.extract())}>
                      Подготовить ответ
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      }
      {
        responded && <Grid item>
          <Card>
            <CardHeader title="Ответ успешно создан!" />
            <CardContent>
              <Grid container
                direction="column"
                justifyContent="center"
                alignItems="stretch">
                <Grid item>
                  <Typography variant="h6">Документ ответа</Typography>
                  <Typography variant="caption">
                    <pre>{
                      JSON.stringify(responded, undefined, 2)
                    }</pre>
                  </Typography>
                </Grid>
                <Grid container
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={1}>
                  <Grid item xs={6}>
                    <CopyToClipboard text={bundle(responded, 'response')} onCopy={copy}>
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

      }
    </Grid>
  }
)

type RequestFields = {
  request: string
}
