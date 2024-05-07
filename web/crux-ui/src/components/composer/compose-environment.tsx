import DyoWrap from '@app/elements/dyo-wrap'
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

  const onEnvFileChange = (name: string, text: string) => dispatch(convertEnvFile(t, name, text))
  const onEnvNameChange = (from: string, to: string) => dispatch(changeEnvFileName(from, to))
  const onRemoveDotEnv = (name: string) => dispatch(removeEnvFile(name))

  const defaultDotEnv = selectDefaultEnvironment(state)

  return (
    <DyoWrap className={className}>
      {state.environment.map((it, index) => (
        <DotEnvFileCard
          key={`dot-env-${index}`}
          dotEnv={it}
          onEnvChange={text => onEnvFileChange(it.name, text)}
          onNameChange={it !== defaultDotEnv ? name => onEnvNameChange(it.name, name) : null}
          onRemove={it !== defaultDotEnv ? () => onRemoveDotEnv(it.name) : null}
        />
      ))}
    </DyoWrap>
  )
}

export default ComposeEnvironment
