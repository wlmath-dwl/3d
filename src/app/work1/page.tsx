
"use client"

import React, { useEffect, useRef } from 'react';
import Paint from '@/utils/paint'

export default function Home() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapRef?.current) return
    const paint = new Paint(wrapRef?.current, {
      viewWidth: 1,
      viewHeight: 1,
    })
    paint.render()
  },[])

  return (
    <main className="flex items-center justify-center h-screen	w-screen bg-slate-100	">
      <div ref={wrapRef} className=" bg-slate-300" style={{width:'400px', height:'400px'}}/>
    </main>
  );
}
