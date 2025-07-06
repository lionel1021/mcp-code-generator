#!/bin/bash

# =====================================================
# Redis Setup Script for LightingPro
# Configures Redis for local development or production
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        log_info "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Generate Redis password
generate_redis_password() {
    if [ -z "$REDIS_PASSWORD" ]; then
        REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        log_info "Generated Redis password: $REDIS_PASSWORD"
    fi
}

# Setup local Redis with Docker
setup_local_redis() {
    log_info "Setting up local Redis with Docker..."
    
    cd "$PROJECT_DIR"
    
    # Generate password if not set
    generate_redis_password
    
    # Create .env file for Docker Compose
    cat > .env.redis << EOF
REDIS_PASSWORD=$REDIS_PASSWORD
EOF
    
    # Start Redis containers
    log_info "Starting Redis containers..."
    docker-compose -f docker-compose.redis.yml --env-file .env.redis up -d
    
    # Wait for Redis to be ready
    log_info "Waiting for Redis to be ready..."
    sleep 10
    
    # Test connection
    if docker exec lighting-app-redis redis-cli -a "$REDIS_PASSWORD" ping | grep -q PONG; then
        log_success "Redis is running and accessible"
        log_info "Redis URL: redis://localhost:6379"
        log_info "Redis UI: http://localhost:8081 (admin/$REDIS_PASSWORD)"
    else
        log_error "Redis connection test failed"
        exit 1
    fi
}

# Setup Upstash Redis (production)
setup_upstash_redis() {
    log_info "Setting up Upstash Redis for production..."
    
    log_info "Please follow these steps to set up Upstash Redis:"
    echo
    echo "1. Go to https://upstash.com/"
    echo "2. Create a free account"
    echo "3. Create a new Redis database"
    echo "4. Copy the REST URL and token"
    echo "5. Add them to your environment variables:"
    echo "   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io"
    echo "   UPSTASH_REDIS_REST_TOKEN=your-token-here"
    echo
    
    log_warning "Upstash setup requires manual configuration"
}

# Install Redis CLI tools
install_redis_tools() {
    log_info "Installing Redis CLI tools..."
    
    if command -v brew &> /dev/null; then
        brew install redis
        log_success "Redis CLI installed via Homebrew"
    elif command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y redis-tools
        log_success "Redis tools installed via APT"
    elif command -v yum &> /dev/null; then
        sudo yum install -y redis
        log_success "Redis installed via YUM"
    else
        log_warning "Please install Redis CLI manually for your system"
    fi
}

# Test Redis connection
test_redis_connection() {
    log_info "Testing Redis connection..."
    
    if [ "$ENVIRONMENT" = "local" ]; then
        # Test local Redis
        if redis-cli -h localhost -p 6379 -a "$REDIS_PASSWORD" ping | grep -q PONG; then
            log_success "Local Redis connection successful"
            return 0
        else
            log_error "Local Redis connection failed"
            return 1
        fi
    elif [ "$ENVIRONMENT" = "upstash" ]; then
        # Test Upstash Redis (requires environment variables)
        if [ -z "$UPSTASH_REDIS_REST_URL" ] || [ -z "$UPSTASH_REDIS_REST_TOKEN" ]; then
            log_warning "Upstash environment variables not set"
            return 1
        fi
        
        # Simple HTTP test to Upstash
        if curl -s -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
           "$UPSTASH_REDIS_REST_URL/ping" | grep -q "PONG"; then
            log_success "Upstash Redis connection successful"
            return 0
        else
            log_error "Upstash Redis connection failed"
            return 1
        fi
    fi
}

# Create Redis test data
create_test_data() {
    log_info "Creating Redis test data..."
    
    if [ "$ENVIRONMENT" = "local" ]; then
        # Create some test cache entries
        redis-cli -h localhost -p 6379 -a "$REDIS_PASSWORD" << EOF
SET test:product:1 '{"id":"1","name":"Test Product","price":99.99}'
SET test:user:123 '{"id":"123","name":"Test User"}'
SETEX test:session:abc 3600 '{"user_id":"123","created_at":"$(date -Iseconds)"}'
EOF
        log_success "Test data created in local Redis"
    fi
}

# Print setup summary
print_summary() {
    log_success "Redis setup completed!"
    echo
    echo "Configuration Summary:"
    echo "====================="
    
    if [ "$ENVIRONMENT" = "local" ]; then
        echo "Environment: Local Docker"
        echo "Redis URL: redis://localhost:6379"
        echo "Password: $REDIS_PASSWORD"
        echo "Management UI: http://localhost:8081"
        echo
        echo "To connect to Redis CLI:"
        echo "redis-cli -h localhost -p 6379 -a $REDIS_PASSWORD"
        echo
        echo "To stop Redis:"
        echo "docker-compose -f docker-compose.redis.yml down"
    elif [ "$ENVIRONMENT" = "upstash" ]; then
        echo "Environment: Upstash (Production)"
        echo "Setup: Manual configuration required"
        echo "Documentation: https://docs.upstash.com/"
    fi
    
    echo
    echo "Next steps:"
    echo "1. Update your .env.local file with Redis configuration"
    echo "2. Test the caching functionality in your application"
    echo "3. Monitor Redis performance and memory usage"
}

# Main execution
main() {
    log_info "Redis Setup Script for LightingPro"
    log_info "=================================="
    
    # Parse command line arguments
    ENVIRONMENT="local"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --upstash)
                ENVIRONMENT="upstash"
                shift
                ;;
            --local)
                ENVIRONMENT="local"
                shift
                ;;
            --help)
                echo "Usage: $0 [--env local|upstash] [--local] [--upstash]"
                echo
                echo "Options:"
                echo "  --env ENV     Set environment (local or upstash)"
                echo "  --local       Setup local Redis with Docker"
                echo "  --upstash     Setup Upstash Redis for production"
                echo "  --help        Show this help message"
                exit 0
                ;;
            *)
                log_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    log_info "Environment: $ENVIRONMENT"
    
    # Execute setup based on environment
    case $ENVIRONMENT in
        "local")
            check_docker
            install_redis_tools
            setup_local_redis
            test_redis_connection
            create_test_data
            ;;
        "upstash")
            setup_upstash_redis
            test_redis_connection
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_info "Use --env local or --env upstash"
            exit 1
            ;;
    esac
    
    print_summary
}

# Error handling
trap 'log_error "Setup failed on line $LINENO"' ERR

# Execute main function
main "$@"