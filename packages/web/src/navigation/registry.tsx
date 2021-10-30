
import { Box, Button, Grid, Tab, Tabs } from '@material-ui/core'
import { REGISTRY_TYPE_CAPABILITY } from '@owlmeans/regov-ssi-capability'
import {
  REGISTRY_SECTION_OWN,
  REGISTRY_TYPE_CLAIMS,
  REGISTRY_TYPE_CREDENTIALS,
  REGISTRY_TYPE_REQUESTS
} from '@owlmeans/regov-ssi-core'

import {
  Switch,
  Route,
  useRouteMatch,
  Link,
  useHistory
} from "react-router-dom"

import {
  CredentialList,
  CredentialListProps
} from "../components"


export const RegistryNavigation = () => {
  const { params, url } = useRouteMatch<CredentialListProps>('/registry/:type/:section')
  const history = useHistory()

  return <Box>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={url} indicatorColor="secondary">
        <Tab label="Документы"
          value={`/registry/${REGISTRY_TYPE_CREDENTIALS}/${REGISTRY_SECTION_OWN}`}
          to={`/registry/${REGISTRY_TYPE_CREDENTIALS}/${REGISTRY_SECTION_OWN}`}
          component={Link}
        />
        <Tab label="Возможности"
          value={`/registry/${REGISTRY_TYPE_CAPABILITY}/${REGISTRY_SECTION_OWN}`}
          to={`/registry/${REGISTRY_TYPE_CAPABILITY}/${REGISTRY_SECTION_OWN}`}
          component={Link}
        />
        <Tab label="Запросы"
          value={`/registry/${REGISTRY_TYPE_REQUESTS}/${REGISTRY_SECTION_OWN}`}
          to={`/registry/${REGISTRY_TYPE_REQUESTS}/${REGISTRY_SECTION_OWN}`}
          component={Link}
        />
        <Tab label="Заявки"
          value={`/registry/${REGISTRY_TYPE_CLAIMS}/${REGISTRY_SECTION_OWN}`}
          to={`/registry/${REGISTRY_TYPE_CLAIMS}/${REGISTRY_SECTION_OWN}`}
          component={Link}
        />
      </Tabs>
    </Box>
    <CredentialList type={params.type} section={params.section} />
    <Switch>
      <Route path={`/registry/${REGISTRY_TYPE_CREDENTIALS}/${REGISTRY_SECTION_OWN}`}>
        <Grid container item spacing={2}
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-end">
          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/credentials/response`)}
            >Предоставить документы</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/credentials/claim`)}
            >Запросить выпуск документов</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/credentials/offer`)}
            >Выпустить документы</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/credentials/store`)}
            >Добавить документы</Button>
          </Grid>
        </Grid>
      </Route>

      <Route path={`/registry/${REGISTRY_TYPE_CAPABILITY}/${REGISTRY_SECTION_OWN}`}>
        <Grid container item spacing={2}
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-end">
          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/capability/store`)}
            >Добавить выписанную возможность</Button>
          </Grid>

          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/capability/claim`)}
            >Выписать возможность у оргнанизации</Button>
          </Grid>

          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/capability/issue`)}
            >Выписать возможность по заявке</Button>
          </Grid>
        </Grid>
      </Route>

      <Route path={`/registry/${REGISTRY_TYPE_REQUESTS}/${REGISTRY_SECTION_OWN}`}>
        <Grid container item spacing={2}
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-end">
          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/capability/request`)}
            >Запросить возможности</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/credentials/request`)}
            >Запросить документы</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary"
              onClick={() => history.push(`/credentials/verify`)}
            >Проверить документы</Button>
          </Grid>
        </Grid>
      </Route>
    </Switch>
  </Box>
}