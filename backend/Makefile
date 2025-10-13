# DJ Union Backend Makefile
# Quick commands for common operations

.PHONY: help install dev test build docker-build docker-push deploy-staging deploy-prod

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm ci

dev: ## Start development server
	npm run start:dev

test: ## Run tests
	npm run test

test-cov: ## Run tests with coverage
	npm run test:cov

lint: ## Run linter
	npm run lint

format: ## Format code with Prettier
	npm run format

build: ## Build application
	npm run build

clean: ## Clean build artifacts
	rm -rf dist/ coverage/ node_modules/

# Docker commands
docker-build-api: ## Build API Docker image
	docker build -t djunion/api:local -f Dockerfile.api .

docker-build-relay: ## Build Relay Worker Docker image
	docker build -t djunion/relay-worker:local -f Dockerfile.relay .

docker-build-transcoder: ## Build Transcoder Docker image
	docker build -t djunion/transcoder:local -f Dockerfile.transcoder .

docker-build-all: docker-build-api docker-build-relay docker-build-transcoder ## Build all Docker images

docker-compose-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-compose-down: ## Stop all services
	docker-compose down

docker-compose-logs: ## View Docker Compose logs
	docker-compose logs -f

# Database commands
db-migrate: ## Run database migrations
	npx prisma migrate deploy

db-migrate-dev: ## Create and apply migration in dev
	npx prisma migrate dev

db-reset: ## Reset database (WARNING: deletes all data)
	npx prisma migrate reset

db-seed: ## Seed database with test data
	npm run seed

db-studio: ## Open Prisma Studio
	npx prisma studio

# Kubernetes commands
k8s-deploy-staging: ## Deploy to staging
	helm upgrade --install djunion-api ./helm/api \
		--namespace audio-api-staging \
		--values helm/api/values-staging.yaml \
		--wait

k8s-deploy-prod: ## Deploy to production (requires confirmation)
	@echo "⚠️  WARNING: Deploying to PRODUCTION"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		helm upgrade --install djunion-api ./helm/api \
			--namespace audio-api-production \
			--values helm/api/values-production.yaml \
			--wait; \
	fi

k8s-logs-staging: ## View staging logs
	kubectl logs -f -n audio-api-staging -l app=djunion-api

k8s-logs-prod: ## View production logs
	kubectl logs -f -n audio-api-production -l app=djunion-api

k8s-status-staging: ## Check staging deployment status
	kubectl get pods -n audio-api-staging

k8s-status-prod: ## Check production deployment status
	kubectl get pods -n audio-api-production

# Security commands
security-scan: ## Run security vulnerability scan
	npm audit
	trivy fs .

security-scan-images: ## Scan Docker images for vulnerabilities
	trivy image djunion/api:local
	trivy image djunion/relay-worker:local
	trivy image djunion/transcoder:local

# Monitoring commands
metrics: ## View Prometheus metrics
	curl http://localhost:3000/v1/metrics

health: ## Check application health
	curl http://localhost:3000/v1/health

# Utility commands
generate-keys: ## Generate JWT RSA key pair
	mkdir -p keys
	openssl genrsa -out keys/jwt_private.pem 4096
	openssl rsa -in keys/jwt_private.pem -pubout -out keys/jwt_public.pem
	chmod 600 keys/jwt_private.pem
	@echo "✅ JWT keys generated in ./keys/"

setup-local: install generate-keys docker-compose-up db-migrate-dev ## Complete local setup
	@echo "✅ Local environment setup complete!"
	@echo "📝 Update .env with your configuration"
	@echo "🚀 Run 'make dev' to start development server"
