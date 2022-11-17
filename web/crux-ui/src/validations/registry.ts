/* eslint-disable import/prefer-default-export */
import {
  GithubNamespace,
  GITHUB_NAMESPACE_VALUES,
  GitlabNamespace,
  GITLAB_NAMESPACE_VALUES,
  RegistryNamespace,
  RegistryType,
  REGISTRY_TYPE_VALUES,
} from '@app/models/registry'
import * as yup from 'yup'
import { descriptionRule, iconRule, nameRule } from './common'

const shouldResetMetaData = { reset: true }

const registryCredentialRole = yup
  .mixed()
  .meta(shouldResetMetaData)
  .when(['type', 'private'], {
    is: (type, _private) =>
      type === 'gitlab' || type === 'github' || ((type === 'v2' || type === 'google') && _private),
    then: yup.string().required(),
    // eslint-disable-next-line no-unneeded-ternary
    otherwise: yup.mixed().transform(it => (it ? it : undefined)),
  })

const googleRegistryUrls = ['gcr.io', 'us.gcr.io', 'eu.gcr.io', 'asia.gcr.io'] as const

export const registrySchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  type: yup.mixed<RegistryType>().oneOf([...REGISTRY_TYPE_VALUES]),
  icon: iconRule,
  imageNamePrefix: yup
    .string()
    .meta(shouldResetMetaData)
    .when('type', {
      is: type => ['hub', 'gitlab', 'github', 'google'].includes(type),
      then: yup.string().required(),
    }),
  url: yup
    .string()
    .meta(shouldResetMetaData)
    .when(['type', 'selfManaged'], {
      is: (type, selfManaged) => type === 'v2' || type === 'google' || (type === 'gitlab' && selfManaged),
      then: yup.string().required(),
    })
    .when(['type'], { is: type => type === 'google', then: yup.string().oneOf([...googleRegistryUrls]) }),
  apiUrl: yup
    .string()
    .meta(shouldResetMetaData)
    .when(['type', 'selfManaged'], {
      is: (type, selfManaged) => type === 'gitlab' && selfManaged,
      then: yup.string().required(),
    }),
  selfManaged: yup.mixed().meta(shouldResetMetaData),
  private: yup.mixed().meta(shouldResetMetaData),
  namespace: yup
    .mixed<RegistryNamespace>()
    .when(['type'], {
      is: type => type === 'gitlab',
      then: yup
        .mixed<GitlabNamespace>()
        .oneOf([...GITLAB_NAMESPACE_VALUES])
        .required(),
    })
    .when(['type'], {
      is: type => type === 'github',
      then: yup
        .mixed<GithubNamespace>()
        .oneOf([...GITHUB_NAMESPACE_VALUES])
        .required(),
    }),
  user: registryCredentialRole,
  token: registryCredentialRole,
})
