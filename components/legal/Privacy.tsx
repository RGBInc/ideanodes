import React from 'react';
import { SimpleHeader } from '../SimpleHeader';

export function Privacy() {
  return (
    <>
      <SimpleHeader />
      <div className="min-h-screen pt-24 pb-20 px-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">Privacy Policy</h1>
        <div className="prose dark:prose-invert text-sm text-zinc-600 dark:text-zinc-400 space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">1. Information Collection</h2>
          <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our interactive features.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">2. Use of Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect IdeaNodes and our users.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">3. Data Storage</h2>
          <p>Your data is stored securely using Convex cloud infrastructure. We implement appropriate technical and organizational measures to protect your personal data.</p>
        </section>
        
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">4. Cookies</h2>
          <p>We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.</p>
        </section>
      </div>
    </div>
    </>
  );
}
