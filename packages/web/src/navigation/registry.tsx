
import { Box, Button, Grid, Tab, Tabs } from '@material-ui/core'
import { REGISTRY_TYPE_CAPABILITY } from '@owlmeans/regov-ssi-capability'
import {
  REGISTRY_SECTION_OWN,
  REGISTRY_TYPE_CREDENTIALS
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
  let { path, params } = useRouteMatch<CredentialListProps>('/registry/:type/:section')
  const history = useHistory()

  return <Box>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={path} indicatorColor="secondary">
        <Tab label="Мои документы"
          value={`/registry/${REGISTRY_TYPE_CREDENTIALS}/${REGISTRY_SECTION_OWN}`}
          to={`/registry/${REGISTRY_TYPE_CREDENTIALS}/${REGISTRY_SECTION_OWN}`}
          component={Link}
        />
        <Tab label="Мои возможности"
          value={`/registry/${REGISTRY_TYPE_CAPABILITY}/${REGISTRY_SECTION_OWN}`}
          to={`/registry/${REGISTRY_TYPE_CAPABILITY}/${REGISTRY_SECTION_OWN}`}
          component={Link}
        />
      </Tabs>
    </Box>
    <CredentialList type={params.type} section={params.section} />
    <Switch>
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
            >Запросить возможность у оргнанизации</Button>
          </Grid>
        </Grid>
      </Route>
    </Switch>
  </Box>
}