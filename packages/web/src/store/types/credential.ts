
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
import { ClaimMembershipCapability } from '../../model/membership'

export type CredentialState = {
  currentClaim?: FreeFormClaimBundle | ClaimBundle<ClaimMembershipCapability>
  claim?: FreeFormClaimBundle | ClaimBundle<ClaimMembershipCapability>
  signed?: FreeFormOfferBundle
  selfSigned?: CapabilityCredential
  credential?: SignedCredentialStateWithErrors
  requested?: RequestBundle
  response?: Presentation
}

export type FreeFormClaimBundle = ClaimBundle<BundledFreeFormClaim>

export type MembershipCapClaimBundle = ClaimBundle<ClaimMembershipCapability>

export type BundledFreeFormClaim = ClaimCredential<ClaimSubject<UnsignedFreeFormCredential>>

export type FreeFormOfferBundle = OfferBundle<BundledFreeFormOffer>

export type BundledFreeFormOffer = OfferCredential<OfferSubject<FreeFormCredential>>

export type FreeFormPresentation = Presentation<FreeFormCredential | EntityIdentity | SatelliteCredential>

export type ClaimBundleTypes = FreeFormClaimBundle | MembershipCapClaimBundle

export type ClaimTypes = BundledFreeFormClaim | ClaimMembershipCapability


export type SignedCredentialStateWithErrors = {
  offer: FreeFormOfferBundle
  errors?: string[]
  issuer?: IdentityPassport
}


export type CredentialReducers = SliceCaseReducers<CredentialState> & {
  claim: (state: CredentialState, action: PayloadAction<ClaimBundleTypes>) => CredentialState

  cleanUp: (state: CredentialState) => CredentialState

  review: (state: CredentialState, action: PayloadAction<FreeFormClaimBundle>) => CredentialState

  sign: (state: CredentialState, action: PayloadAction<FreeFormOfferBundle>) => CredentialState

  selfSign: (state: CredentialState, action: PayloadAction<CapabilityCredential>) => CredentialState

  request: (state: CredentialState, action: PayloadAction<RequestBundle>) => CredentialState

  response: (state: CredentialState, action: PayloadAction<Presentation>) => CredentialState

  verify: (state: CredentialState, action: PayloadAction<SignedCredentialStateWithErrors>) => CredentialState
}