import { compose } from 'recompose'

import { List, ListItem, ListItemText } from "@material-ui/core"
import { FunctionComponent } from "react"
import { withWallet } from '../../model/context'
import { PropsWithWallet } from '../../model/types'
import { CapabilityCredential, CREDENTIAL_GOVERNANCE_TYPE } from '@owlmeans/regov-ssi-capability'


export const CredentialList: FunctionComponent<CredentialListProps> = compose(withWallet)
  (
    (
      { type, section, wallet }: CredentialListProps & PropsWithWallet
    ) => {
      const list = wallet?.getRegistry(type).registry.credentials[section]

      return <List>
        {
          list?.map(
            ({ credential: cred }) => <ListItem>
              <ListItemText key={cred.id}
                primary={
                  cred.type.includes(CREDENTIAL_GOVERNANCE_TYPE)
                    ? (cred as CapabilityCredential).credentialSubject.name
                    : cred.id
                }
                secondary={JSON.stringify(cred.type)}
              />
            </ListItem>
          )
        }
      </List>
    }
  )

export type CredentialListProps = {
  type: string
  section: string
}