/* eslint-disable import/prefer-default-export */
import {
  GITHUB_NAMESPACE_VALUES,
  GITLAB_NAMESPACE_VALUES,
  GithubNamespace,
  GitlabNamespace,
  REGISTRY_TYPE_VALUES,
  RegistryNamespace,
  RegistryType,
} from '@app/models'
import { descriptionRule, iconRule, nameRule } from './common'
import yup from './yup'

const shouldResetMetaData = { reset: true }

/**
 * Creates a Yup schema for a registry credential role based on the provided label.
 * The schema defines validation rules for whether a field is required or not
 * based on the 'type', 'public' and `changeCredentials` properties in the input data.
 *
 * @param label - The label to be used for the schema.
 * @returns A Yup schema instance.
 */
const createRegistryCredentialRole = (label: string) =>
  yup
    .string()
    .meta(shouldResetMetaData)
    .requiredWhenTypeIs({
      public: ['gitlab', 'github'],
      private: ['v2', 'google', 'hub'],
    })
    .label(label)

const googleRegistryUrls = ['gcr.io', 'us.gcr.io', 'eu.gcr.io', 'asia.gcr.io'] as const

export const registrySchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  type: yup.mixed<RegistryType>().oneOf([...REGISTRY_TYPE_VALUES]),
  icon: iconRule,
  imageNamePrefix: yup
    .string()
    .meta(shouldResetMetaData)
    .requiredWhenTypeIs(['hub', 'gitlab', 'github', 'google'])
    .labelType({
      hub: 'orgOrUser',
      google: 'organization',
      gitlab: it => it.labelNamespace('group', 'registries:group', 'registries:project'),
      github: it => it.labelNamespace('organization', 'registries:organization', 'registries:userName'),
    }),
  url: yup
    .string()
    .meta(shouldResetMetaData)
    .label('registries:url')
    .when(['type', 'selfManaged', 'local'], {
      is: (type: RegistryType, selfManaged?: boolean, local?: boolean) =>
        type === 'v2' || type === 'google' || (type === 'gitlab' && selfManaged) || (type === 'unchecked' && !local),
      then: s => s.required(),
      otherwise: s => s.nullable().optional(),
    })
    .whenType('google', s => s.oneOf([...googleRegistryUrls])),
  apiUrl: yup
    .string()
    .label('registries:apiUrl')
    .meta(shouldResetMetaData)
    .when(['type', 'selfManaged'], {
      is: (type: RegistryType, selfManaged?: boolean) => type === 'gitlab' && selfManaged,
      then: s => s.required(),
      otherwise: s => s.nullable().optional(),
    }),
  selfManaged: yup.mixed().meta(shouldResetMetaData).label('registries:selfManaged'),
  public: yup.mixed().meta(shouldResetMetaData).label('registries:public'),
  namespace: yup
    .mixed<RegistryNamespace>()
    .label('registries:namespaceType')
    .whenType('gitlab', () =>
      yup
        .mixed<GitlabNamespace>()
        .oneOf([...GITLAB_NAMESPACE_VALUES])
        .required(),
    )
    .whenType('github', () =>
      yup
        .mixed<GithubNamespace>()
        .oneOf([...GITHUB_NAMESPACE_VALUES])
        .required(),
    ),
  user: createRegistryCredentialRole('user'),
  token: createRegistryCredentialRole('pat').labelType({
    gitlab: 'token',
    github: 'pat',
    v2: 'token',
    google: 'privateKey',
    hub: 'token',
  }),
})

// eslint-disable-next-line no-template-curly-in-string
export const nameTagSchema = yup.string().matches(/^[^:]+(:[^:]+)?$/, { message: 'images:invalidImageFormat' })
