
import {
  Presentation,
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
  ClaimBundleTypes,
  ClaimTypes,
  FreeFormClaimBundle,
  FreeFormPresentation,
  MembershipPresentation,
  OfferBundleTypes,
  OfferTypes
} from '../store/types/credential'
import {
  CREDENTIAL_CLAIM_TYPE,
  CREDENTIAL_OFFER_TYPE,
  holderCredentialHelper,
  issuerCredentialHelper,
  RequestBundle,
  verifierCredentialHelper
} from '@owlmeans/regov-ssi-agent'
import { MembershipCredential, MembershipDoc, MembershipExt, MEMBERSHIP_CREDENTIAL_TYPE } from './membership'
import { ByCapabilityExtension, holderCapabilityVisitor, verifierCapabilityHelper } from '@owlmeans/regov-ssi-capability'


export const credentialHelper = (wallet: WalletWrapper) => {
  const _holderHelper = holderCredentialHelper<FreeFromPayload, {}, FreeFormCredential>(wallet)
  const _issuerHelper = issuerCredentialHelper<FreeFromPayload, {}, FreeFormCredential>(wallet)
  const _verifierHelper = verifierCredentialHelper(wallet)

  const _helper = {
    verify: async (presentation: FreeFormPresentation | MembershipPresentation): Promise<{
      result: boolean,
      errors: string[],
      issuer?: IdentityPassport
    }> => {
      if ((presentation as Presentation).verifiableCredential.find(
        cred => cred.type.includes(MEMBERSHIP_CREDENTIAL_TYPE)
      )) {

        let { result, credentials, dids, entity } = await verifierCredentialHelper(wallet)
            .response().verify(presentation as any)
        // @TODO This shouldn't be this way - it should check satellites @BUG @BLOCKER
        // const { result, entity } = await verifierCapabilityHelper<MembershipCredential>(wallet)
        //   .response().verify(presentation as any)

        return {
          result,
          errors: [],
          issuer: entity.credentialSubject.data.identity as IdentityPassport
        }
      }

      const { result, entity } = await _verifierHelper.response().verify(presentation as any)

      return {
        result,
        errors: [],
        issuer: entity.credentialSubject.data.identity as IdentityPassport
      }
    },

    unbundleCredClaim: async (bundle: ClaimBundleTypes): Promise<[boolean, ClaimTypes[]]> => {
      const _bundleHelper = _helper.buildFreeFormIssuerHelper()

      const { result, claims } = await _bundleHelper.unbudle(bundle as any)

      return [result, claims]
    },

    signCredClaims: async (claims: ClaimTypes[]) => {
      const _bundleHelper = _helper.buildFreeFormIssuerHelper()

      const offers = await _issuerHelper.claim().signClaims(claims as any)

      return await _bundleHelper.build(offers)
    },

    signClaim: async (bundle: ClaimBundleTypes): Promise<OfferBundleTypes | undefined> => {
      const _bundleHelper = _helper.buildFreeFormIssuerHelper()

      const { result, claims } = await _bundleHelper.unbudle(bundle as any)
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

    unbundleClaim: (bundle: ClaimBundleTypes) => {
      return (bundle?.verifiableCredential as ClaimTypes[])?.find(
        claim => claim.type.includes(CREDENTIAL_CLAIM_TYPE)
      )
    },

    unbundleOffer: (bundle: OfferBundleTypes) => {
      return (bundle?.verifiableCredential as OfferTypes[])?.find(
        offer => offer.type.includes(CREDENTIAL_OFFER_TYPE)
      )
    },

    request: async (type: string | string[], source?: string, store = true) => {
      const req = await verifierCredentialHelper(wallet).request()
        .build({ '@type': type, ...(source ? { source } : {}) })

      const bundle = await verifierCredentialHelper(wallet).request().bundle([req])

      if (store) {
        await verifierCredentialHelper(wallet).request().register(bundle)
      }

      return bundle
    },

    response: async (request: RequestBundle) => {
      const { result, requests } = await holderCredentialHelper(wallet)
        .request().unbundle(request)

      if (!result) {
        throw new Error("Неверный запрос документов")
      }

      if (requests[0].credentialSubject.data['@type'].includes(MEMBERSHIP_CREDENTIAL_TYPE)) {
        return await holderCredentialHelper<
          MembershipDoc,
          MembershipExt,
          MembershipCredential,
          ByCapabilityExtension
        >(wallet, holderCapabilityVisitor<
          MembershipDoc,
          MembershipExt
        >()(wallet))
          .response().build(requests, request)
      }

      return await holderCredentialHelper(wallet).response().build(requests, request)
    }
  }

  return _helper
}