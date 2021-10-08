
import { PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit'
import { DIDDocument, DIDDocumentUnsinged } from '@owlmeans/regov-ssi-did'
import { FreeFormCredential, IdentityPassport, UnsignedFreeFormCredential } from '../../model/types'
import { ClaimBundle, ClaimCredential, ClaimSubject, EntityIdentity, OfferBundle, OfferCredential, OfferSubject, RequestBundle, SatelliteCredential } from '@owlmeans/regov-ssi-agent'
import { Presentation } from '@owlmeans/regov-ssi-core'
import { CapabilityCredential, OfferCapability } from '@owlmeans/regov-ssi-capability'

export type CredentialState = {
  currentClaim?: FreeFormClaimBundle
  claim?: FreeFormClaimBundle
  signed?: FreeFormOfferBundle
  selfSigned?: CapabilityCredential
  credential?: SignedCredentialStateWithErrors
  requested?: RequestBundle
}

export type FreeFormClaimBundle = ClaimBundle<BundledFreeFormClaim>

export type BundledFreeFormClaim = ClaimCredential<ClaimSubject<UnsignedFreeFormCredential>>

export type FreeFormOfferBundle = OfferBundle<BundledFreeFormOffer>

export type BundledFreeFormOffer = OfferCredential<OfferSubject<FreeFormCredential>>

export type FreeFormPresentation = Presentation<FreeFormCredential | EntityIdentity | SatelliteCredential>


export type SignedCredentialStateWithErrors = {
  offer: FreeFormOfferBundle
  errors?: string[]
  issuer?: IdentityPassport
}


export type CredentialReducers = SliceCaseReducers<CredentialState> & {
  claim: (state: CredentialState, action: PayloadAction<FreeFormClaimBundle>) => CredentialState

  cleanUp: (state: CredentialState) => CredentialState

  review: (state: CredentialState, action: PayloadAction<FreeFormClaimBundle>) => CredentialState

  sign: (state: CredentialState, action: PayloadAction<FreeFormOfferBundle>) => CredentialState

  selfSign: (state: CredentialState, action: PayloadAction<CapabilityCredential>) => CredentialState

  request: (state: CredentialState, action: PayloadAction<RequestBundle>) => CredentialState

  verify: (state: CredentialState, action: PayloadAction<SignedCredentialStateWithErrors>) => CredentialState
}