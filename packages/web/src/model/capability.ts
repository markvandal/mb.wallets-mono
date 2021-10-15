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
import { MembershipCapClaimBundle, MembershipCapOfferBundle } from '../store/types/credential'
import { ClaimMembershipCapability, OfferMembershipCapability } from './membership'


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

    signClaim: async (claimPres: MembershipCapClaimBundle) => {
      const { result, claims } = await issuerCredentialHelper(wallet)
        .bundle<ClaimMembershipCapability, OfferMembershipCapability>().unbudle(claimPres)
      if (!result) {
        throw new Error('Предоставленный запрос неверен или небезопасен')
      }

      const offers = await Promise.all(claims.map(
        async claim => await governanceCredentialHelper(wallet).offer(claim)
      ))

      return await issuerCredentialHelper(wallet)
        .bundle<ClaimMembershipCapability, OfferMembershipCapability>().build(offers)
    },

    storeOffer: async (offer: MembershipCapOfferBundle) => {
      const { result } = await holderCredentialHelper<
        CapabilityDocument, CapabilityExtension,
        CapabilityCredential, OfferCapabilityExtension
      >(wallet, holderGovernanceVisitor(wallet))
        .bundle().unbudle(offer as any)
      if (!result) {
        throw new Error('Invalid bundle with capability')
      }

      return await holderCredentialHelper<
        CapabilityDocument, CapabilityExtension,
        CapabilityCredential, OfferCapabilityExtension
      >(wallet, holderGovernanceVisitor(wallet))
        .bundle().store(offer as any)
    }
  }

  return _helper
}