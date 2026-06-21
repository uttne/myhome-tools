import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>myhome-tools</CardTitle>
        <CardDescription>家族向けサービス Hub</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">認証済みユーザー向けの Hub 画面です。</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">続ける</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>買い物リスト</CardTitle>
        <CardDescription>未完了 5 件</CardDescription>
      </CardHeader>
    </Card>
  ),
};
