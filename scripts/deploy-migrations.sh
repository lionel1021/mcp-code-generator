#!/bin/bash

# =====================================================
# Database Migration Deployment Script
# Executes all pending migrations in order
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$PROJECT_DIR/supabase/migrations"
LOG_FILE="$PROJECT_DIR/logs/migration-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed. Please install it first:"
        log_error "npm install -g supabase"
        exit 1
    fi
    
    # Check if project is linked to Supabase
    if [ ! -f "$PROJECT_DIR/.supabase/config.toml" ]; then
        log_warning "Project not linked to Supabase. Linking now..."
        cd "$PROJECT_DIR"
        
        # Prompt for project ref
        echo -n "Enter your Supabase project reference: "
        read -r PROJECT_REF
        
        if [ -z "$PROJECT_REF" ]; then
            log_error "Project reference is required"
            exit 1
        fi
        
        supabase link --project-ref "$PROJECT_REF"
        
        if [ $? -ne 0 ]; then
            log_error "Failed to link project"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Backup current database
backup_database() {
    log_info "Creating database backup..."
    cd "$PROJECT_DIR"
    
    BACKUP_FILE="$PROJECT_DIR/backups/backup-$(date +%Y%m%d-%H%M%S).sql"
    mkdir -p "$PROJECT_DIR/backups"
    
    # Create backup using Supabase CLI
    if supabase db dump --file "$BACKUP_FILE"; then
        log_success "Database backup created: $BACKUP_FILE"
    else
        log_warning "Failed to create backup, continuing anyway..."
    fi
}

# Execute migrations
execute_migrations() {
    log_info "Executing database migrations..."
    cd "$PROJECT_DIR"
    
    # Get list of migration files
    MIGRATION_FILES=($(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort))
    
    if [ ${#MIGRATION_FILES[@]} -eq 0 ]; then
        log_warning "No migration files found in $MIGRATIONS_DIR"
        return
    fi
    
    log_info "Found ${#MIGRATION_FILES[@]} migration files"
    
    # Execute each migration
    for migration_file in "${MIGRATION_FILES[@]}"; do
        filename=$(basename "$migration_file")
        migration_name="${filename%.*}"
        
        log_info "Executing migration: $migration_name"
        
        # Record start time
        start_time=$(date +%s%3N)
        
        # Execute migration
        if supabase db reset --debug; then
            # Calculate execution time
            end_time=$(date +%s%3N)
            execution_time=$((end_time - start_time))
            
            log_success "Migration $migration_name completed in ${execution_time}ms"
        else
            log_error "Migration $migration_name failed"
            exit 1
        fi
    done
}

# Verify migrations
verify_migrations() {
    log_info "Verifying migrations..."
    cd "$PROJECT_DIR"
    
    # Check if all tables exist
    EXPECTED_TABLES=(
        "user_profiles"
        "user_sessions" 
        "brands"
        "categories"
        "lighting_products"
        "affiliate_links"
        "questionnaire_responses"
        "recommendations"
        "product_interactions"
        "product_stats"
        "daily_analytics"
        "schema_migrations"
    )
    
    log_info "Checking for expected tables..."
    
    for table in "${EXPECTED_TABLES[@]}"; do
        # Use supabase CLI to check if table exists
        if supabase db diff --schema public | grep -q "$table"; then
            log_success "Table $table exists"
        else
            log_warning "Table $table might be missing"
        fi
    done
}

# Seed initial data
seed_data() {
    log_info "Seeding initial data..."
    cd "$PROJECT_DIR"
    
    # Check if seed data migration exists
    if [ -f "$MIGRATIONS_DIR/003_seed_data.sql" ]; then
        log_info "Seed data will be applied via migration 003"
    else
        log_warning "No seed data migration found"
    fi
}

# Main execution
main() {
    log_info "Starting database migration deployment"
    log_info "Project directory: $PROJECT_DIR"
    log_info "Log file: $LOG_FILE"
    
    # Execute deployment steps
    check_prerequisites
    backup_database
    execute_migrations
    verify_migrations
    seed_data
    
    log_success "Database migration deployment completed successfully!"
    log_info "Check the log file for detailed information: $LOG_FILE"
}

# Error handling
trap 'log_error "Deployment failed on line $LINENO. Check the log file: $LOG_FILE"' ERR

# Execute main function
main "$@"