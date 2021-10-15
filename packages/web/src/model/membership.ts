
import {
  Credential,
  CredentialSubject,
  Presentation,
  UnsignedCredential,
  WalletWrapper,
  WrappedDocument
} from '@owlmeans/regov-ssi-core'
import {
  ClaimCredential,
  ClaimSubject,
  EntityIdentity,
  holderCredentialHelper,
  OfferCredential,
  OfferSubject,
} from '@owlmeans/regov-ssi-agent'
import {
  CapabilityCredential,
  CapabilityDocument,
  CapabilityExtension,
  CapabilitySubject,
  CREDENTIAL_GOVERNANCE_TYPE,
  governanceCredentialHelper,
  UnsignedCapabilityCredential,
} from '@owlmeans/regov-ssi-capability'

import { passportHelper } from './passport'


export const membershipHelper = (wallet: WalletWrapper) => {
  const _helper = {
    claimCapability: async (gov: Presentation<EntityIdentity | CapabilityCredential>) => {
      const source = passportHelper(wallet).getIdentity().identity
      if (!source) {
        throw new Error('No identity to claim for')
      }
      const root = gov.verifiableCredential.find(
        cap => cap.type.includes(CREDENTIAL_GOVERNANCE_TYPE)
      ) as CapabilityCredential

      const claim = await governanceCredentialHelper(wallet).claim<MembershipDoc, MembershipExt>(
        source,
        {
          root,
          name: 'Возможность предоставлять членство',
          type: [MEMBERSHIP_CREDENTIAL_TYPE, MEMBERSHIP_CAPABILITY_TYPE]
        },
        {
          '@type': [MEMBERSHIP_CREDENTIAL_TYPE, MEMBERSHIP_CAPABILITY_TYPE],
          subjectSchema: {
            description: { '@id': 'scm:description', '@type': 'xsd:string' },
            role: { '@id': 'scm:role', '@type': 'xsd:string' },
            organization: { '@id': 'scm:organization', '@type': 'xsd:string' },
          },
          subjectProps: {
            payload: {
              role: 'Роль члена организации',
              description: 'Опциональное описание члена органиазции и его функций'
            },
            extension: {
              organization: root.credentialSubject.name
            }
          }
        }
      )

      const claimPres = await holderCredentialHelper<
        MembershipCapabilityDoc, CapabilityExtension, MembershipCapability
      >(wallet).bundle<ClaimMembershipCapability, OfferMembershipCapability>().build([claim])

      await holderCredentialHelper(wallet).claim({ type: MEMBERSHIP_CREDENTIAL_TYPE })
        .register(claimPres)

      return claimPres
    }
  }

  return _helper
}


export const MEMBERSHIP_CAPABILITY_TYPE = 'OrganizationMembershipCapability'

export const MEMBERSHIP_CREDENTIAL_TYPE = 'OrganizationMemmbership'

export type ClaimMembershipCapability = ClaimCredential<ClaimSubject<UnsignedMembershipCapability>>

export type OfferMembershipCapability = OfferCredential<OfferSubject<MembershipCapability>>

export type MembershipCapabilityDoc = CapabilityDocument<MembershipDoc, MembershipExt>

export type UnsignedMembershipCapability
  = UnsignedCapabilityCredential<CapabilitySubject<MembershipDoc, MembershipExt>>

export type MembershipCapability = CapabilityCredential<CapabilitySubject<MembershipDoc, MembershipExt>>

export type UnsignedMembershipCredential = UnsignedCredential<MembershipSubject>

export type MembershipCredential = Credential<MembershipSubject>

export type MembershipSubject = CredentialSubject<WrappedDocument<MembershipDoc>, MembershipExt>

export type MembershipDoc = {
  role: string
  description?: string
}

export type MembershipExt = {
  organization: string
}