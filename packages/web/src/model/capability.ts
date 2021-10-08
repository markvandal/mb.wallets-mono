import {
  WalletWrapper,
} from '@owlmeans/regov-ssi-core'

import {
  CapabilityCredential,
  CapabilityDocument,
  CapabilityExtension,
  ClaimCapability,
  governanceCredentialHelper,
  holderGovernanceVisitor,
  OfferCapability,
  OfferCapabilityExtension
} from '@owlmeans/regov-ssi-capability'

import {
  passportHelper
} from './passport'

import { holderCredentialHelper, issuerCredentialHelper } from '@owlmeans/regov-ssi-agent'


export const capabilityHelper = (wallet: WalletWrapper) => {
  const _governanceHelper = governanceCredentialHelper(wallet)

  const _helper = {
    selfIssueGovernance: async (name: string) => {
      const claim = await _governanceHelper.claimGovernance(
        passportHelper(wallet).getIdentity().identity,
        { name }
      )

      const bundle = await issuerCredentialHelper(wallet)
        .bundle<ClaimCapability, OfferCapability>().build([await _governanceHelper.offer(claim)])

      return await holderCredentialHelper<
        CapabilityDocument, CapabilityExtension, CapabilityCredential, OfferCapabilityExtension
      >(wallet, holderGovernanceVisitor(wallet)).bundle().store(bundle)
    },
  }

  return _helper
}