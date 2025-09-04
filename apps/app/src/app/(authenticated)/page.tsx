'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

import type React from 'react';

export default function Home(): React.ReactElement | null {
  useEffect(() => {
    redirect('/dashboard');
  }, []);
  
  return null;
}
