import type { Meta, StoryObj } from "@storybook/react";
import { CphSearch } from "../src/components/Search/Search";
const meta: Meta<typeof CphSearch> = { title: "Colophon/Search", component: CphSearch };
export default meta;
type S = StoryObj<typeof CphSearch>;
export const Default: S = {};
export const CustomPlaceholder: S = { args: { placeholder: "Search sources, concepts…" } };
