'use client';

import React, { Profiler } from 'react';

export default function ProfilerWrapper({ children }: { children: React.ReactNode }) {
  const onRender = (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    console.log(`[Profiler:${id}] phase=${phase} actual=${actualDuration}ms base=${baseDuration}ms`);
  };

  return (
    <Profiler id="App" onRender={onRender}>
      {children}
    </Profiler>
  );
}
