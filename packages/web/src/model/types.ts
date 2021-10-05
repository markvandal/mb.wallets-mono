import {
  Credential,
  CredentialType,
  CredentialSubject,
  WrappedDocument,
  CredentialWrapper,
  Identity,
  IdentitySubject,
  UnsignedCredential, 
  WalletWrapper,
  BASE_CREDENTIAL_TYPE
} from "@owlmeans/regov-ssi-core"


export type PropsWithWallet = { wallet: WalletWrapper }

export type IdentityPassportWrapper = CredentialWrapper<IdentityPassportSubject, IdentityPassport>

export type IdentityPassport = Identity<IdentityPassportSubject>

export type IdentityPassportSubject = IdentitySubject<IdentityPassportDoc>

export type IdentityPassportDoc = WrappedDocument<PassportPayload>

export type PassportPayload = { info: string }

export type FreeFormDoc = WrappedDocument<FreeFromPayload>

export type FreeFromPayload = { freeform: string }

export type FreeFormSubject = CredentialSubject<FreeFormDoc>

export type UnsignedFreeFormCredential = UnsignedCredential<FreeFormSubject>

export type FreeFormCredential = Credential<FreeFormSubject>


export const DID_PREFIX = process.env.REACT_APP_DID_PREFIX || 'metatest'

export const WALLET_TYPE_PREFIX = DID_PREFIX[0].toUpperCase() + DID_PREFIX.substr(1)

export const TYPE_PASSPORT_SUBJECT = `${WALLET_TYPE_PREFIX}PassportIdentity`

export const TYPE_CREDENTIAL_FREEFORM = `${WALLET_TYPE_PREFIX}FreeFormCredential`

export const BASE_CREDENTIAL_SCHEMA = process.env.REACT_APP_DID_SCHEMA || 'https://www.w3.org/2018/credentials/v1'

export const PASSPORT_CREDENTIAL_TYPES: CredentialType = [BASE_CREDENTIAL_TYPE, TYPE_PASSPORT_SUBJECT]

export const FREEFORM_CREDENTIAL_TYPES: CredentialType = [BASE_CREDENTIAL_TYPE, TYPE_CREDENTIAL_FREEFORM]


export const ERROR_BUNDLER_WRONG_PREFIX = 'ERROR_BUNDLER_WRONG_PREFIX'

export const ERROR_BUNDLER_WRONG_STRUCTURE = 'ERROR_BUNDLER_WRONG_STRUCTURE'

export const ERROR_BUNDLER_UNSUPPORTED_DID_PREFIX = 'ERROR_BUNDLER_UNSUPPORTED_DID_PREFIX'

export const ERROR_VERIFICATION_NOIDENTITY = 'ERROR_VERIFICATION_NOIDENTITY'