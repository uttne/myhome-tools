import { StorybookConfig } from '@storybook/react-vite';

const config : StorybookConfig ={
    stories:['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    framework: "@storybook/react-vite",

    docs: {
        autodocs: true
    },

    typescript: {
        reactDocgen: 'react-docgen-typescript'
    },

    addons: ['@chromatic-com/storybook']
};

export default config;