import { Module } from '@nestjs/common'
import EditorServiceProvider from './editor.service.provider'
import EditorService from './editor.service'
import EditorColorProvider from './editor.color.provider'

@Module({
  imports: [],
  exports: [EditorServiceProvider],
  controllers: [],
  providers: [EditorServiceProvider, EditorColorProvider, EditorService],
})
export default class EditorModule {}
