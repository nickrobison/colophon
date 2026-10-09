import type { Meta, StoryObj } from "@storybook/react";

import { CphPagination } from "../src/components/Pagination/CphPagination";
const meta: Meta<typeof CphPagination> = {
  title: "Components/Table/CphPagination",
  component: CphPagination,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof CphPagination>;
export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    pageSize: 8,
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
};
