import { REGEX_ERROR_NO_WHITESPACES, getValidationError, matchNoLeadingOrTrailingWhitespaces } from './common'
import * as yup from 'yup'

describe('common validation tests', () => {
  describe('matchNoTrailingWhitespace', () => {
    const schema = matchNoLeadingOrTrailingWhitespaces(yup.string())

    it('should be invalid with a trailing spaces', () => {
      const actual = getValidationError(schema, 'Invalid trailing spaces ')

      expect(actual?.message).toEqual(REGEX_ERROR_NO_WHITESPACES)
    })

    it('should be invalid with a leading spaces', () => {
      const actual = getValidationError(schema, ' Invalid leading spaces')

      expect(actual?.message).toEqual(REGEX_ERROR_NO_WHITESPACES)
    })

    it('should be invalid with a both leading and trailing spaces', () => {
      const actual = getValidationError(schema, ' Invalid leading and trailing spaces ')

      expect(actual?.message).toEqual(REGEX_ERROR_NO_WHITESPACES)
    })

    it('should be valid without leading and trailing spaces', () => {
      const actual = getValidationError(schema, 'Valid without spaces')

      expect(actual).toBeNull()
    })

    it('should be valid with no spaces at all', () => {
      const actual = getValidationError(schema, 'Validwithnospacesatall')

      expect(actual).toBeNull()
    })
  })
})
