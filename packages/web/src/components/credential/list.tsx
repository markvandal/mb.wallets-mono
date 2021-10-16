import { compose } from 'recompose'

import { List, ListItem, ListItemText } from "@material-ui/core"
import { FunctionComponent } from "react"
import { withWallet } from '../../model/context'
import { PropsWithWallet } from '../../model/types'
import { CapabilityCredential, CREDENTIAL_CAPABILITY_TYPE, CREDENTIAL_GOVERNANCE_TYPE } from '@owlmeans/regov-ssi-capability'
import { MembershipCapability } from '../../model/membership'
import { CREDENTIAL_CLAIM_TYPE } from '@owlmeans/regov-ssi-agent'
import { MembershipClaimBundle } from '../../store/types/credential'
import { CredentialSubject, CredentialWrapper, Presentation, RegistryItem } from '@owlmeans/regov-ssi-core'


export const CredentialList: FunctionComponent<CredentialListProps> = compose(withWallet)
  (
    (
      { type, section, wallet }: CredentialListProps & PropsWithWallet
    ) => {
      const list = wallet?.getRegistry(type).registry.credentials[section] as CredentialWrapper<
        CredentialSubject,
        RegistryItem<CredentialSubject, Presentation>
      >[]

      return <List>
        {
          list?.map(
            ({ credential: cred }) => <ListItem>
              <ListItemText key={cred.id}
                primary={
                  cred.type.includes(CREDENTIAL_GOVERNANCE_TYPE)
                    ? (cred as CapabilityCredential).credentialSubject.name
                    : cred.type.includes(CREDENTIAL_CAPABILITY_TYPE)
                      ? `
                          ${(cred as MembershipCapability).credentialSubject.name}
                          -
                          ${JSON.stringify((cred as MembershipCapability).credentialSubject.data.subjectProps.extension)}
                        `
                      : cred.type.includes(CREDENTIAL_CLAIM_TYPE)
                        ? `
                          ${JSON.stringify((cred as MembershipClaimBundle).verifiableCredential[1].credentialSubject.data['@type'])}
                        `
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