import { LoginForm } from "@/components/layout/login-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in — Pilay",
};

export default function LoginPage() {
  return (
    <div className='relative grid min-h-screen overflow-hidden bg-background lg:grid-cols-2'>
      {/* Brand panel — the blue rail, carrying identity + one marigold accent */}
      <div className='relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(178deg,var(--blue-600)_0%,var(--blue-800)_100%)] p-12 text-white lg:flex'>
        <div className='relative flex items-center gap-3'>
          <div className='grid size-11 place-items-center rounded-[13px] bg-marigold text-lg font-extrabold text-marigold-foreground'>
            P
          </div>
          <div className='leading-tight'>
            <span className='text-lg font-extrabold tracking-tight'>Pilay</span>
            <span className='block text-xs font-medium text-[#B9C2F5]'>
              Counselor portal
            </span>
          </div>
        </div>

        <div className='relative'>
          <div className='mx-auto w-full max-w-[300px] rounded-3xl bg-[#fefefe] p-6 shadow-soft-lg'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/illustrations/make-peace.svg'
              alt='Two people making a pinky promise'
              width={400}
              height={400}
              className='h-auto w-full'
            />
          </div>
          <div className='mt-8 max-w-sm'>
            <h2 className='text-3xl leading-tight font-extrabold tracking-tight text-balance'>
              Guidance &amp; safeguarding, in one calm place.
            </h2>
            <p className='mt-3 text-sm leading-relaxed text-[#C7CFF8]'>
              Counseling sessions, incidents, behavior logs, and follow-ups —
              organized so you can focus on the student, not the paperwork.
            </p>
          </div>
        </div>

        <p className='relative text-xs text-[#B9C2F5]'>
          Confidential — for authorized school personnel only.
        </p>
      </div>

      <svg
        aria-hidden
        viewBox='0 0 120 1000'
        preserveAspectRatio='none'
        className='pointer-events-none absolute inset-y-0 left-[48%] hidden h-full w-[120px] -translate-x-px lg:block'
      >
        <defs>
          <linearGradient id='login-wave' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor='var(--blue-600)' />
            <stop offset='100%' stopColor='var(--blue-800)' />
          </linearGradient>
        </defs>
        <path
          d='M0,0 L64,0 C104,90 24,180 64,270 C104,360 24,450 64,540 C104,630 24,720 64,810 C104,900 24,990 64,1000 L0,1000 Z'
          fill='url(#login-wave)'
        />
      </svg>

      {/* Sign-in area — centered card, floating just past the wave */}
      <div className='relative z-10 flex flex-col items-center justify-center gap-4 p-6'>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className='max-w-sm text-center text-xs text-muted-foreground lg:hidden'>
          Confidential — for authorized school personnel only.
        </p>
      </div>
    </div>
  );
}
