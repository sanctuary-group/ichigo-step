import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

fontAwesomeConfig.autoAddCss = false;

const appName = 'ichigo-step';

createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob<{ default: React.ComponentType }>(
            './Pages/**/*.tsx',
            { eager: true },
        );
        const page = pages[`./Pages/${name}.tsx`];
        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#10b981',
    },
});
