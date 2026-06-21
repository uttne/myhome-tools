import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="grid w-full max-w-sm gap-2">
        <Label htmlFor="demo-input">メールアドレス</Label>
        <Story />
      </div>
    ),
  ],
  args: {
    id: "demo-input",
    type: "email",
    placeholder: "user@example.com",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "入力不可",
  },
};

export const Invalid: Story = {
  args: {
    "aria-invalid": true,
    defaultValue: "invalid@",
  },
};
