import { Version } from '@prisma/client'
import { constants } from '../consts'

export enum VersionType {
  INCREMENTAL = 'incremental',
  ROLLING = 'rolling',
}

export const versions = [
  {
    id: constants.VERSION_ID,
    name: '1.0.0',
    changelog:
      'Sed eu justo at dolor efficitur fermentum at sed quam. Nullam tellus magna, sollicitudin eu elementum sit amet, gravida sed tortor.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    productId: constants.PRODUCT_ID,
    type: VersionType.INCREMENTAL,
    default: true,
  },
  {
    name: '1.2.0',
    changelog:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae libero at quam molestie semper. Vivamus eget est aliquam mauris vestibulum tincidunt.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    productId: constants.PRODUCT_ID,
    type: VersionType.INCREMENTAL,
    default: false,
  },
  {
    name: '2.0.0',
    changelog:
      'Nullam non blandit mauris. Nunc sagittis nec ante a hendrerit. Integer maximus eget nunc eu eleifend. Ut mattis tellus mauris.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    productId: constants.PRODUCT_ID,
    type: VersionType.INCREMENTAL,
    default: false,
  },
  {
    name: 'dev',
    changelog: 'Cras id rutrum purus. Ut luctus placerat erat.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    productId: constants.PRODUCT_ID,
    type: VersionType.ROLLING,
    default: false,
  },
  {
    id: '89020402-b8bb-4e03-9c58-f4fec5f2692b',
    name: 'rolling',
    changelog: 'Cras id rutrum purus. Ut luctus placerat erat.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    type: VersionType.ROLLING,
    productId: '89020402-b8bb-4e03-9c58-f4fec5f2692b',
    default: false,
  },
  {
    id: '5260B9D6-0BE0-491B-8808-836DC285B12C',
    name: 'Local test local product version 0.0.1',
    changelog: 'Changelog',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    type: VersionType.ROLLING,
    productId: '399B5495-0ACA-4395-88B3-EF1AA2C2E015',
    default: true,
  },
] as Version[]
