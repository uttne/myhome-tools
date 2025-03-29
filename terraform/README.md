
## 変更の適用

```bash
terraform apply
```

## frontend の適用

```bash
cd ../front
pnpm run build
cd ../terraform
terraform apply
```

## backend の適用

```bash
cd ../backend
uv run task build
cd ../terraform
terraform apply
```