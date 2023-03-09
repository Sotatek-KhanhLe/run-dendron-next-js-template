import {
  ConfigUtils,
  CONSTANTS,
  DendronConfig,
  NoteProps,
  Theme,
} from '@dendronhq/common-all';
import {
  batch,
  createLogger,
  ideSlice,
  Provider,
  setLogLevel,
} from '@dendronhq/common-frontend';
import 'antd/dist/antd.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ThemeSwitcherProvider } from 'react-css-theme-switcher';
import { useDendronGATracking } from '../components/DendronGATracking';
import DendronLayout from '../components/DendronLayout';
import { DendronRef } from '../components/DendronRef';
import DendronProvider from '../context/DendronProvider';
import { combinedStore, useCombinedDispatch } from '../features';
import { browserEngineSlice } from '../features/engine';
import { useIFrameHeightAdjuster } from '../hooks/useIFrameHeightAdjuster';
import '../public/assets-dendron/css/light.css';
import '../styles/scss/main-nextjs.scss';
import { getLogLevel } from '../utils/etc';
import { fetchConfig, fetchNotes, fetchTreeMenu } from '../utils/fetchers';
import { useDendronRouter } from '../utils/hooks';
import { getAssetUrl } from '../utils/links';
import { NoteData } from '../utils/types';
import { defaultsDeep } from 'lodash';

const themes: { [key in Theme]: string } = {
  dark: getAssetUrl(`/assets-dendron/css/dark.css`),
  light: getAssetUrl(`/assets-dendron/css/light.css`),
  custom: getAssetUrl(`/themes/${CONSTANTS.CUSTOM_THEME_CSS}`),
};

type PageProps = {
  noteIndex: NoteProps;
  config: DendronConfig;
  body?: string;
};

function DendronApp({
  Component,
  pageProps,
}: AppProps & { pageProps: PageProps }) {
  const [noteData, setNoteData] = useState<NoteData>();
  const logger = createLogger('App');
  const dendronRouter = useDendronRouter();
  const dispatch = useCombinedDispatch();
  useDendronGATracking();
  useIFrameHeightAdjuster();

  useEffect(() => {
    (async () => {
      const data = await fetchTreeMenu();
      dispatch(ideSlice.actions.setTree(data));
      // logger.info({ ctx: 'fetchTree:got-data', data });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // logger.info({ ctx: 'fetchNotes:pre' });
      const data = await fetchNotes();
      // logger.info({ ctx: 'fetchNotes:got-data' });
      setNoteData(data);
      batch(() => {
        dispatch(browserEngineSlice.actions.setNotes(data.notes));
        dispatch(browserEngineSlice.actions.setNoteIndex(data.noteIndex));
      });
      const config = await fetchConfig();
      console.log('🚀 ~ file: _app.tsx:110 ~ config:', config);
      // logger.info({ ctx: 'fetchConfig:got-data' });
      console.log(
        '🚀 ~ file: _app.tsx:82 ~ ConfigUtils.genDefaultConfig():',
        ConfigUtils.genDefaultConfig()
      );
      config.publishing = ConfigUtils.genDefaultConfig().publishing;
      // dendron json config response is the old version whereas the site property still exist but this template is using latest version
      config.publishing.siteUrl = (config as any).site.siteUrl;

      dispatch(browserEngineSlice.actions.setConfig(config));
    })();
  }, []);
  // logger.info({ ctx: 'render' });

  return (
    // @ts-ignore
    <DendronProvider>
      <DendronLayout
        {...noteData}
        noteIndex={pageProps.noteIndex}
        dendronRouter={dendronRouter}
      >
        <Head>
          <link rel='icon' href={getAssetUrl('/favicon.ico')} />
        </Head>
        <Component
          {...pageProps}
          notes={noteData}
          dendronRouter={dendronRouter}
        />
      </DendronLayout>
    </DendronProvider>
  );
}

function AppContainer(appProps: AppProps & { pageProps: PageProps }) {
  const { config } = appProps.pageProps;
  // const logger = createLogger('AppContainer');
  useEffect(() => {
    const logLevel = getLogLevel();
    setLogLevel(logLevel);
  }, []);

  const router = useRouter();

  const defaultTheme = ConfigUtils.getPublishing(config).theme || Theme.LIGHT;
  // logger.info({ ctx: 'enter', defaultTheme });
  const body = appProps.pageProps.body ?? '';
  if (router.pathname === '/refs/[id]') {
    return (
      <Provider store={combinedStore}>
        <ThemeSwitcherProvider themeMap={themes} defaultTheme={defaultTheme}>
          <DendronRef body={body} />
        </ThemeSwitcherProvider>
      </Provider>
    );
  }

  return (
    <Provider store={combinedStore}>
      <ThemeSwitcherProvider themeMap={themes} defaultTheme={defaultTheme}>
        <DendronApp {...appProps} />
      </ThemeSwitcherProvider>
    </Provider>
  );
}

export default AppContainer;
