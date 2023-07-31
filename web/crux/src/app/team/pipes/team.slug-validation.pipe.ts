import { PipeTransform } from '@nestjs/common'
import { CruxBadRequestException } from 'src/exception/crux-exception'

type SlugDto = {
  slug: string
}

export default class TeamSlugValidationPipe implements PipeTransform<SlugDto, SlugDto> {
  transform(value: SlugDto): SlugDto {
    const { slug } = value

    const slugified = TeamSlugValidationPipe.slugify(slug, '-')

    if (slugified !== slug) {
      throw new CruxBadRequestException({
        message: 'Invalid slug.',
        property: 'slug',
        value: slug,
      })
    }

    return value
  }

  // https://gist.github.com/codeguy/6684588?permalink_comment_id=3426313#gistcomment-3426313
  private static slugify(value: string, separator: string) {
    return value
      .toString()
      .normalize('NFD') // split an accented letter in the base letter and the acent
      .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
      .replace(/\s+/g, separator)
  }
}
