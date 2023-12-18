import { MixedSchema, StringSchema } from 'yup'

declare module 'yup' {
  declare interface RequiredWhenTypeOptions {
    public: RegistryType | RegistryType[]
    private: RegistryType | RegistryType[]
  }

  interface MixedSchema {
    whenType(type: RegistryType | RegistryType[], then: (s: MixedSchema<any, any, any>) => MixedSchema<any, any, any>)
  }

  interface StringSchema {
    requiredWhenTypeIs(options: RequiredWhenTypeOptions | RegistryType[]): StringSchema
    labelNamespace(when: string, thenLabel: string, otherwiseLabel: string): StringSchema
    labelType(
      labels: Record<string, string | ((s: StringSchema<any, any, any>) => StringSchema<any, any, any>)>,
    ): StringSchema
    whenType(type: RegistryType | RegistryType[], then: (s: StringSchema<any, any, any>) => StringSchema<any, any, any>)
  }
}
