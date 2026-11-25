import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // Garante compatibilidade com serverless functions na Vercel
      runtime: 'nodejs20.x'
    })
  }
};

export default config;