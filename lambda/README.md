
## Prep claudia

```sh
brew install awscli 
aws configure
npm install -g claudia
```

# Prep AWS resources

```sh
# Create buckets and/or queues etc
```

## Deploy lambda

```sh
git clone https://github.com/bls/snap-sniff
cd snap-sniff/lambda
npm install
claudia create --region ap-southeast-2 --api-module app
```

