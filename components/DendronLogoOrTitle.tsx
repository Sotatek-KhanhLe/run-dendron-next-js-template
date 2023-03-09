import { ConfigUtils, PublishUtils } from '@dendronhq/common-all';
import { verifyEngineSliceState } from '@dendronhq/common-frontend';
import Link from 'next/link';
import React from 'react';
import { useEngineAppSelector } from '../features/engine/hooks';
import { DENDRON_STYLE_CONSTANTS } from '../styles/constants';
import { getRootUrl } from '../utils/links';

export default function DendronLogoOrTitle() {
  const engine = useEngineAppSelector((state) => state.engine);
  if (!verifyEngineSliceState(engine)) {
    return null;
  }
  const { title } = PublishUtils.getSEOPropsFromConfig(engine.config);
  console.log(
    '🚀 ~ file: DendronLogoOrTitle.tsx:15 ~ DendronLogoOrTitle ~ engine.config:',
    engine.config
  );
  const logoUrl = ConfigUtils.getSiteLogoUrl(engine.config) || '';

  const publishingConfig = ConfigUtils.getPublishing(engine.config);

  return (
    <Link href={getRootUrl(publishingConfig)}>
      <a
        style={{
          display: 'inline-block',
          height: DENDRON_STYLE_CONSTANTS.HEADER.HEIGHT,
          padding: '4px',
          width: '100%',
        }}
        className='site-title'
      >
        {logoUrl ? <Logo logoUrl={logoUrl} /> : <Title data={title || ''} />}
      </a>
    </Link>
  );
}

export function Logo({ logoUrl }: { logoUrl: string }) {
  return (
    <img
      src={logoUrl}
      className='site-logo'
      alt='logo'
      style={{
        objectFit: 'contain',
        height: '100%',
        verticalAlign: 'top',
      }}
    />
  );
}

export function Title({ data }: { data: string }) {
  return (
    <div
      className='site-title'
      title={data}
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {data}
    </div>
  );
}
