import { ReactNode, StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client';
import "@radix-ui/themes/styles.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import './index.scss';
import App from './App'
import { Theme } from '@radix-ui/themes';

const ThemeMatcher = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  useEffect(() => {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    matcher.addEventListener('change', listener);
    return () => matcher.removeEventListener('change', listener);
  }, []);

  return <Theme appearance={theme}>{children}</Theme>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeMatcher>
      <App />
    </ThemeMatcher>
  </StrictMode>,
)
