import Head from 'next/head';
import { useEffect, useState } from 'react';
import { AppRouter } from './AppRouter';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      <Head>
        <title>Agentic Orchestrator - Tiger Cloud Challenge</title>
        <meta name="description" content="Multi-agent orchestration for Agentic Postgres" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isClient && <AppRouter />}
    </>
  );
}
