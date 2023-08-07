import { Module } from '@nestjs/common'
import EditorColorProvider from './editor.color.provider'
import EditorService from './editor.service'
import EditorServiceProvider from './editor.service.provider'

@Module({
  imports: [],
  exports: [EditorServiceProvider],
  controllers: [],
  providers: [EditorServiceProvider, EditorColorProvider, EditorService],
})
export default class EditorModule {}
