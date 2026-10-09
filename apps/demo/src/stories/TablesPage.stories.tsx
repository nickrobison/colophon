import type { Meta, StoryObj } from "@storybook/react";

import { TablesPage } from "../pages/TablesPage";
const meta: Meta<typeof TablesPage> = {
  title: "Demo/TablesPage",
  component: TablesPage,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof TablesPage>;
export const Default: Story = {};
