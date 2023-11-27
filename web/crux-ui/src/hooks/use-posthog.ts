import { isServerSide } from '@app/utils'
import { useRouter } from 'next/router'
import posthog, { PostHog, Properties } from 'posthog-js'
import { QAGroupProperties, QASettings, QA_GROUP_TYPE, QA_SETTINGS_PROP, QA_URL } from 'quality-assurance'
import { useEffect } from 'react'

const getSanitizer =
  (pathName: string) =>
  (props: Properties): Properties => {
    if (props.$host) {
      delete props.$host
    }

    if (props.$current_url) {
      delete props.$current_url
    }

    if (props.$pathname) {
      props.$pathname = pathName
    }

    if (props.title) {
      delete props.title
    }

    return props
  }

const onLoaded = (ph: PostHog) => {
  if (process.env.NODE_ENV === 'development') {
    ph.debug()
  }
}

if (!isServerSide()) {
  posthog.init('phc_wc4nEUy7HYW8Elf8G9jiccvl2ZYt8pVts8NVBRMPzHu', {
    api_host: QA_URL,
    enable_recording_console_log: false,
    ip: false,
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    persistence: 'localStorage+cookie',
    loaded: onLoaded,
    opt_out_capturing_by_default: true,
  }) as PostHog
}

const usePosthog = (pageProps: any) => {
  const router = useRouter()
  const { pathname } = router

  const settings: QASettings = pageProps[QA_SETTINGS_PROP]

  useEffect(() => {
    if (!settings) {
      posthog.resetGroups()
      posthog.opt_out_capturing()
      return
    }

    if (posthog.has_opted_in_capturing()) {
      return
    }

    posthog.set_config({
      sanitize_properties: getSanitizer(pathname),
    })

    const groupProps: QAGroupProperties = {
      name: settings.groupName,
    }

    posthog.opt_in_capturing({
      clear_persistence: true,
    })

    posthog.group(QA_GROUP_TYPE, settings.groupId, groupProps)
  }, [settings, pathname])

  useEffect(() => {
    posthog.set_config({
      sanitize_properties: getSanitizer(pathname),
    })

    posthog.capture('$pageview', undefined, {
      $set: {
        $pathname: pathname,
      },
    })
  }, [pathname])
}

export default usePosthog
