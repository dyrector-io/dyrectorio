import { Product } from "@prisma/client"
import { constants } from "../consts"

export enum ProductType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
}

export const products = [
  {
    id: '89020402-b8bb-4e03-9c58-f4fec5f2692b',
    name: 'Simple product',
    description:
      'Sed eu justo at dolor efficitur fermentum at sed quam. Nullam tellus magna, sollicitudin eu elementum sit amet, gravida sed tortor.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    type: ProductType.SIMPLE,
    teamId: constants.TEAM_ID,
  },
  {
    id: '399B5495-0ACA-4395-88B3-EF1AA2C2E015',
    name: 'Local test @ Product',
    description:
      ' Nulla a orci nisl. Aliquam tincidunt lacinia tincidunt. Nunc lorem nulla, finibus et nisi eget, fringilla congue mauris. Integer lectus tellus, hendrerit id volutpat ut, vulputate a elit. Nullam id mi a ipsum venenatis cursus.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    type: ProductType.COMPLEX,
    teamId: constants.TEAM_ID,
  },
  {
    id: constants.PRODUCT_ID,
    name: 'Product 003',
    description:
      'Aliquam id porttitor dui, vestibulum condimentum urna. Aliquam lobortis arcu et tellus ultricies molestie.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    type: ProductType.COMPLEX,
    teamId: constants.TEAM_ID,
  },
  {
    name: 'Product 004',
    description:
      'Quisque sit amet gravida nisi. Duis a euismod nunc. Proin vehicula ac leo at pretium. Nunc vitae diam fermentum erat finibus pharetra sed eget tortor. Proin mi augue, placerat vitae vehicula et, ultrices at nulla.',
    createdBy: 'a27c0bb3-4c67-4a60-9f0e-5ef2bc6c666b',
    createdAt: new Date(),
    type: ProductType.COMPLEX,
    teamId: constants.TEAM_ID,
  },
] as Product[]
