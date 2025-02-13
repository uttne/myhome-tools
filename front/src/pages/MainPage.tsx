import { Stack, Card, Button } from "@mui/joy";

export function MainPage() {
  return (
    <>
      <Stack spacing={1} direction="row" useFlexGap sx={{flexWrap: "wrap"}}>
        <Card>aaaa</Card>
        <Card>aaaa</Card>
        <Card>aaaa</Card>
        <Card>aaaa</Card>
        <Button onClick={async ()=>{
          const res = await fetch("/api/").then(res=>res.json());
          alert(res.msg);
        }}>click</Button>
      </Stack>
    </>
  );
}
