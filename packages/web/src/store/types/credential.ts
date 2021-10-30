
import { PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import {
  FreeFormCredential,
  IdentityPassport,
  UnsignedFreeFormCredential
} from '../../model/types'
import {
  ClaimBundle,
  ClaimCredential,
  ClaimSubject,
  EntityIdentity,
  OfferBundle,
  OfferCredential,
  OfferSubject,
  RequestBundle,
  SatelliteCredential
} from '@owlmeans/regov-ssi-agent'
import { Presentation } from '@owlmeans/regov-ssi-core'
import { CapabilityCredential } from '@owlmeans/regov-ssi-capability'
import { ClaimMembershipCapability, ClaimMembershipCredential, MembershipCredential, OfferMembershipCapability, OfferMembershipCredential } from '../../model/membership'

export type CredentialState = {
  currentClaim?: ClaimBundleTypes
  claim?: ClaimBundleTypes
  signed?: OfferBundleTypes
  selfSigned?: CapabilityCredential
  credential?: SignedCredentialStateWithErrors
  requested?: RequestBundle
  response?: Presentation
}

export type FreeFormClaimBundle = ClaimBundle<BundledFreeFormClaim>

export type MembershipCapClaimBundle = ClaimBundle<ClaimMembershipCapability>
export type MembershipCapOfferBundle = OfferBundle<OfferMembershipCapability>

export type MembershipClaimBundle = ClaimBundle<ClaimMembershipCredential>
export type MembershipOfferBundle = OfferBundle<OfferMembershipCredential>

export type BundledFreeFormClaim = ClaimCredential<ClaimSubject<UnsignedFreeFormCredential>>

export type FreeFormOfferBundle = OfferBundle<BundledFreeFormOffer>

export type BundledFreeFormOffer = OfferCredential<OfferSubject<FreeFormCredential>>


export type FreeFormPresentation = Presentation<FreeFormCredential | EntityIdentity | SatelliteCredential>
export type MembershipPresentation = Presentation<MembershipCredential | EntityIdentity | SatelliteCredential>

export type ClaimBundleTypes = FreeFormClaimBundle | MembershipCapClaimBundle | MembershipClaimBundle

export type ClaimTypes = BundledFreeFormClaim | ClaimMembershipCapability | ClaimMembershipCredential
export type OfferTypes = BundledFreeFormOffer | OfferMembershipCapability | OfferMembershipCredential

export type OfferBundleTypes = FreeFormOfferBundle | MembershipCapOfferBundle | MembershipOfferBundle


export type SignedCredentialStateWithErrors = {
  offer: FreeFormOfferBundle
  errors?: string[]
  issuer?: IdentityPassport
}


export type CredentialReducers = SliceCaseReducers<CredentialState> & {
  claim: (state: CredentialState, action: PayloadAction<ClaimBundleTypes>) => CredentialState

  cleanUp: (state: CredentialState) => CredentialState

  review: (state: CredentialState, action: PayloadAction<FreeFormClaimBundle>) => CredentialState

  sign: (state: CredentialState, action: PayloadAction<OfferBundleTypes>) => CredentialState

  selfSign: (state: CredentialState, action: PayloadAction<CapabilityCredential>) => CredentialState

  request: (state: CredentialState, action: PayloadAction<RequestBundle>) => CredentialState

  response: (state: CredentialState, action: PayloadAction<Presentation>) => CredentialState

  verify: (state: CredentialState, action: PayloadAction<SignedCredentialStateWithErrors>) => CredentialState
}