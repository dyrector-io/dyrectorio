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
import { Schema } from 'yup'
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
    .mixed()
    .meta(shouldResetMetaData)
    .when(['type', 'public', 'changeCredentials'], {
      is: (type: RegistryType, _public: boolean, changeCredentials: boolean) => {
        if (!changeCredentials) {
          return false
        }

        return (
          type === 'gitlab' || type === 'github' || (!_public && (type === 'v2' || type === 'google' || type === 'hub'))
        )
      },
      then: () => yup.string().required().label(label),
      otherwise: () => yup.mixed().label(label),
    })

const googleRegistryUrls = ['gcr.io', 'us.gcr.io', 'eu.gcr.io', 'asia.gcr.io'] as const

const typeLabel = (
  schema: Schema<any, any, any>,
  labels: Record<string, string | ((s: Schema<any, any, any>) => Schema<any, any, any>)>,
) =>
  Object.entries(labels).reduce(
    (it, [labelType, label]) =>
      it.when('type', {
        is: type => type === labelType,
        then: s => (typeof label === 'string' ? s.label(label) : label(s)),
      }),
    schema,
  )

export const registrySchema = yup.object().shape({
  name: nameRule,
  description: descriptionRule,
  type: yup.mixed<RegistryType>().oneOf([...REGISTRY_TYPE_VALUES]),
  icon: iconRule,
  imageNamePrefix: typeLabel(
    yup
      .string()
      .meta(shouldResetMetaData)
      .when('type', {
        is: type => ['hub', 'gitlab', 'github', 'google'].includes(type),
        then: s => s.required(),
      }),
    {
      hub: 'orgOrUser',
      gitlab: it =>
        it.when('namespace', {
          is: namespace => namespace === 'group',
          then: s => s.label('registries:group'),
          otherwise: s => s.label('registries:project'),
        }),
      github: it =>
        it.when('namespace', {
          is: namespace => namespace === 'organization',
          then: s => s.label('registries:organization'),
          otherwise: s => s.label('registries:userName'),
        }),
      google: 'organization',
    },
  ),
  url: yup
    .string()
    .meta(shouldResetMetaData)
    .label('registries:url')
    .when(['type', 'selfManaged', 'local'], {
      is: (type, selfManaged, local) =>
        type === 'v2' || type === 'google' || (type === 'gitlab' && selfManaged) || (type === 'unchecked' && !local),
      then: s => s.required(),
      otherwise: s => s.nullable(),
    })
    .when(['type'], { is: type => type === 'google', then: s => s.oneOf([...googleRegistryUrls]) }),
  apiUrl: yup
    .string()
    .label('registries:apiUrl')
    .meta(shouldResetMetaData)
    .when(['type', 'selfManaged'], {
      is: (type, selfManaged) => type === 'gitlab' && selfManaged,
      then: s => s.required(),
      otherwise: s => s.nullable(),
    }),
  selfManaged: yup.mixed().meta(shouldResetMetaData).label('registries:selfManaged'),
  public: yup.mixed().meta(shouldResetMetaData).label('registries:public'),
  namespace: yup
    .mixed<RegistryNamespace>()
    .label('registries:namespaceType')
    .when(['type'], {
      is: type => type === 'gitlab',
      then: () =>
        yup
          .mixed<GitlabNamespace>()
          .oneOf([...GITLAB_NAMESPACE_VALUES])
          .required(),
    })
    .when(['type'], {
      is: type => type === 'github',
      then: () =>
        yup
          .mixed<GithubNamespace>()
          .oneOf([...GITHUB_NAMESPACE_VALUES])
          .required(),
    }),
  user: createRegistryCredentialRole('user'),
  token: typeLabel(createRegistryCredentialRole('pat'), {
    gitlab: 'token',
    github: 'pat',
    v2: 'token',
    google: 'privateKey',
    hub: 'token',
  }),
})

// eslint-disable-next-line no-template-curly-in-string
export const nameTagSchema = yup.string().matches(/^[^:]+(:[^:]+)?$/, { message: 'images:invalidImageFormat' })
