
import {
  WalletWrapper,
} from '@owlmeans/regov-ssi-core'

import {
  FreeFormCredential,
  FreeFromPayload,
  IdentityPassport,
  TYPE_CREDENTIAL_FREEFORM,
} from './types'
import {
  BundledFreeFormClaim,
  BundledFreeFormOffer,
  FreeFormClaimBundle,
  FreeFormOfferBundle,
  FreeFormPresentation
} from '../store/types/credential'
import {
  CREDENTIAL_CLAIM_TYPE,
  CREDENTIAL_OFFER_TYPE,
  holderCredentialHelper,
  issuerCredentialHelper,
  verifierCredentialHelper
} from '@owlmeans/regov-ssi-agent'


export const credentialHelper = (wallet: WalletWrapper) => {
  const _holderHelper = holderCredentialHelper<FreeFromPayload, {}, FreeFormCredential>(wallet)
  const _issuerHelper = issuerCredentialHelper<FreeFromPayload, {}, FreeFormCredential>(wallet)
  const _verifierHelper = verifierCredentialHelper(wallet)

  const _helper = {
    verify: async (presentation: FreeFormPresentation): Promise<{
      result: boolean,
      errors: string[],
      issuer?: IdentityPassport
    }> => {
      const { result, entity } = await _verifierHelper.response().verify(presentation)

      return {
        result,
        errors: [],
        issuer: entity.credentialSubject.data.identity as IdentityPassport
      }
    },

    signClaim: async (bundle: FreeFormClaimBundle): Promise<FreeFormOfferBundle | undefined> => {
      const _bundleHelper = _helper.buildFreeFormIssuerHelper()

      const { result, claims } = await _bundleHelper.unbudle(bundle)
      if (result) {
        const offers = await _issuerHelper.claim().signClaims(claims)

        return await _bundleHelper.build(offers)
      }
    },

    buildFreeFormIssuerHelper: () => _issuerHelper
      .bundle<BundledFreeFormClaim, BundledFreeFormOffer>(),

    buildFreeFormClaimHelper: () => _holderHelper.claim({
      type: TYPE_CREDENTIAL_FREEFORM,
      schemaUri: 'credential/freeform/v1'
    }),

    createClaim: async (freeform: string): Promise<FreeFormClaimBundle> => {
      const _claimHelper = _helper.buildFreeFormClaimHelper()

      const claim = await _claimHelper.build({ freeform })

      const bundle = await _holderHelper.bundle<BundledFreeFormClaim>().build([claim])

      return bundle
    },

    unbundleClaim: (bundle: FreeFormClaimBundle) => {
      return bundle?.verifiableCredential?.find(
        claim => claim.type.includes(CREDENTIAL_CLAIM_TYPE)
      )
    },

    unbundleOffer: (bundle: FreeFormOfferBundle) => {
      return bundle?.verifiableCredential?.find(
        offer => offer.type.includes(CREDENTIAL_OFFER_TYPE)
      )
    }
  }

  return _helper
}