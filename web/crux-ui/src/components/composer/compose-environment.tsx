import DyoWrap from '@app/elements/dyo-wrap'
import { DotEnvironment } from '@app/models'
import useTranslation from 'next-translate/useTranslation'
import DotEnvFileCard from './dot-env-file-card'
import {
  ComposerDispatch,
  ComposerState,
  changeEnvFileName,
  convertEnvFile,
  removeEnvFile,
  selectDefaultEnvironment,
} from './use-composer-state'

type ComposeEnvironmentProps = {
  className?: string
  state: ComposerState
  dispatch: ComposerDispatch
}

const ComposeEnvironment = (props: ComposeEnvironmentProps) => {
  const { className, state, dispatch } = props

  const { t } = useTranslation('compose')

  const onEnvFileChange = (target: DotEnvironment, text: string) => dispatch(convertEnvFile(t, target, text))
  const onEnvNameChange = (target: DotEnvironment, to: string) => dispatch(changeEnvFileName(target, to))
  const onRemoveDotEnv = (target: DotEnvironment) => dispatch(removeEnvFile(t, target))

  const defaultDotEnv = selectDefaultEnvironment(state)

  return (
    <DyoWrap className={className}>
      {state.environment.map((it, index) => (
        <DotEnvFileCard
          key={`dot-env-${index}`}
          dotEnv={it}
          onEnvChange={text => onEnvFileChange(it, text)}
          onNameChange={it !== defaultDotEnv ? name => onEnvNameChange(it, name) : null}
          onRemove={it !== defaultDotEnv ? () => onRemoveDotEnv(it) : null}
        />
      ))}
    </DyoWrap>
  )
}

export default ComposeEnvironment
