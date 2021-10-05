
import { identityHelper } from '@owlmeans/regov-ssi-agent'
import { WalletWrapper } from '@owlmeans/regov-ssi-core'
import {
  IdentityPassportSubject,
  PassportPayload,
  TYPE_PASSPORT_SUBJECT
} from './types'


export const passportHelper = (wallet: WalletWrapper) => {
  const _idHelper = identityHelper<PassportPayload, IdentityPassportSubject>(
    wallet,
    wallet.ssi.buildContext('identity', {
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      info: { '@id': 'scm:firstname', '@type': 'xsd:string' }
    })
  )

  const _helper = {
    ..._idHelper,

    getPassportInfo: () => {
      return _idHelper.getIdentityData().info
    },

    getPassportSubjectContent: (subject: IdentityPassportSubject) => {
      return _idHelper.extractIdentitySubjectData(subject).info
    },

    createPassport: async (info: string) => {
      return await _idHelper.createIdentity(TYPE_PASSPORT_SUBJECT, { info })
    }
  }

  return _helper
}