# LSP-MCP Bridge Makefile (TypeScript)
.PHONY: install build clean test run help lint format type-check dev-python dev-go dev-ts dev-rust dev-cpp dev-custom coverage

# Default target
.DEFAULT_GOAL := build

# Binary name and directories
BINARY_NAME=lsp-mcp-bridge
DIST_DIR=dist
SRC_DIR=src

## install: Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

## build: Build TypeScript to JavaScript
build: install
	@echo "🔨 Building TypeScript project..."
	npm run build
	@echo "✅ Built to $(DIST_DIR)/"

## clean: Clean build artifacts and dependencies
clean:
	@echo "🧹 Cleaning..."
	npm run clean
	@rm -rf node_modules
	@echo "✨ Cleaned build artifacts and dependencies"

## test: Run tests
test: install
	@echo "🧪 Running tests..."
	npm run test

## test-coverage: Run tests with coverage
test-coverage: install
	@echo "📊 Running tests with coverage..."
	npm run test:coverage

## test-watch: Run tests in watch mode
test-watch: install
	@echo "👀 Running tests in watch mode..."
	npm run test -- --watch

## run: Build and run with default settings (TypeScript LSP)
run: build
	@echo "📘 Running $(BINARY_NAME) with TypeScript LSP..."
	./$(DIST_DIR)/cli.js --lsp="typescript-language-server --stdio"

## dev: Run in development mode
dev: install
	@echo "🚀 Running in development mode..."
	npm run dev

## lint: Lint TypeScript code
lint: install
	@echo "🔧 Linting code..."
	npm run lint
	@echo "✅ Linting completed"

## format: Format TypeScript code
format: install
	@echo "✨ Formatting code..."
	npm run format
	@echo "💎 Code formatted"

## type-check: Run TypeScript type checking
type-check: install
	@echo "🔍 Running type checking..."
	npm run type-check
	@echo "✅ Type checking completed"

## check: Run all checks (lint, format, type-check, test)
check: lint format type-check test
	@echo "🎉 All checks completed"

## dev-python: Run with Python LSP server (pylsp)
dev-python: build
	@echo "🐍 Running with Python LSP server..."
	./$(DIST_DIR)/cli.js --verbose --lsp="pylsp"

## dev-go: Run with Go LSP server (gopls)
dev-go: build
	@echo "🐹 Running with Go LSP server..."
	./$(DIST_DIR)/cli.js --verbose --lsp="gopls"

## dev-ts: Run with TypeScript LSP server
dev-ts: build
	@echo "📘 Running with TypeScript LSP server..."
	./$(DIST_DIR)/cli.js --verbose --lsp="typescript-language-server --stdio"

## dev-rust: Run with Rust LSP server (rust-analyzer)
dev-rust: build
	@echo "🦀 Running with Rust LSP server..."
	./$(DIST_DIR)/cli.js --verbose --lsp="rust-analyzer"

## dev-cpp: Run with C++ LSP server (clangd)
dev-cpp: build
	@echo "⚡ Running with C++ LSP server..."
	./$(DIST_DIR)/cli.js --verbose --lsp="clangd"

## dev-java: Run with Java LSP server (jdtls)
dev-java: build
	@echo "☕ Running with Java LSP server..."
	./$(DIST_DIR)/cli.js --verbose --lsp="jdtls"

## dev-custom: Run with custom LSP server (usage: make dev-custom LSP="your-lsp-command")
dev-custom: build
	@if [ -z "$(LSP)" ]; then \
		echo "⚙️ Usage: make dev-custom LSP=\"your-lsp-command\""; \
		echo "💡 Example: make dev-custom LSP=\"clangd\""; \
		exit 1; \
	fi
	@echo "🚀 Running with custom LSP server: $(LSP)..."
	./$(DIST_DIR)/cli.js --verbose --lsp="$(LSP)"

## dev-http: Run with HTTP LSP server (usage: make dev-http URL="http://localhost:8080")
dev-http: build
	@if [ -z "$(URL)" ]; then \
		echo "⚙️ Usage: make dev-http URL=\"http://localhost:8080\""; \
		echo "💡 Example: make dev-http URL=\"http://lsp-server.internal:3333\""; \
		exit 1; \
	fi
	@echo "🌐 Running with HTTP LSP server: $(URL)..."
	./$(DIST_DIR)/cli.js --verbose --lsp-http="$(URL)"

## size: Show built binary size
size: build
	@echo "📏 Binary sizes:"
	@ls -lh $(DIST_DIR)/*.js | awk '{print $$5 "\t" $$9}'

## deps-check: Check for outdated dependencies
deps-check:
	@echo "🔍 Checking for outdated dependencies..."
	npm outdated

## deps-update: Update dependencies
deps-update:
	@echo "⬆️ Updating dependencies..."
	npm update
	@echo "✅ Dependencies updated"

## audit: Run security audit
audit:
	@echo "🔒 Running security audit..."
	npm audit

## audit-fix: Fix security vulnerabilities
audit-fix:
	@echo "🔧 Fixing security vulnerabilities..."
	npm audit fix

## version: Show Node.js and npm version info
version:
	@echo "📦 Environment info:"
	@echo "Node.js version:"
	@node --version
	@echo "npm version:"
	@npm --version
	@echo "TypeScript version:"
	@npx tsc --version

## help: Show this help message
help:
	@echo "🌉 LSP-MCP Bridge Makefile (TypeScript)"
	@echo ""
	@echo "📋 Available targets:"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed -e 's/^/ /'
	@echo ""
	@echo "💡 Examples:"
	@echo "  make install                  # 📦 Install dependencies"
	@echo "  make build                    # 🔨 Build the application"
	@echo "  make run                      # 📘 Build and run with TypeScript LSP"
	@echo "  make dev-ts                   # 📘 Run with TypeScript language server"
	@echo "  make dev-custom LSP=\"jdtls\"   # ☕ Run with Java language server"
	@echo "  make dev-http URL=\"http://localhost:8080\"  # 🌐 Run with HTTP LSP server"
	@echo "  make test                     # 🧪 Run tests"
	@echo "  make check                    # ✅ Run all checks"
	@echo "  make clean                    # 🧹 Clean everything"
	@echo ""
	@echo "🚀 Development workflow:"
	@echo "  make install && make dev-ts"