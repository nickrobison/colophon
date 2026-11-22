export const baseStorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y", "@storybook/addon-interactions"],
  framework: { name: "@storybook/react-vite", options: {} },
} as const;
