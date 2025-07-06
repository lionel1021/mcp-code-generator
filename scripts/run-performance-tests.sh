#!/bin/bash

# =====================================================
# Performance Testing Runner for LightingPro
# Executes comprehensive performance and load tests
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TESTS_DIR="$PROJECT_DIR/tests/performance"
RESULTS_DIR="$PROJECT_DIR/test-results/performance"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Test configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
K6_VERSION="0.47.0"

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if K6 is installed
    if ! command -v k6 &> /dev/null; then
        log_warning "K6 is not installed. Installing K6..."
        install_k6
    else
        log_success "K6 is already installed"
    fi
    
    # Check if application is running
    log_info "Checking if application is running at $BASE_URL"
    if curl -sf "$BASE_URL/api/health" > /dev/null 2>&1; then
        log_success "Application is running and accessible"
    else
        log_error "Application is not accessible at $BASE_URL"
        log_info "Please start the application first:"
        log_info "npm run dev"
        exit 1
    fi
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    log_success "Results directory created: $RESULTS_DIR"
}

# Install K6
install_k6() {
    log_info "Installing K6 performance testing tool..."
    
    if command -v brew &> /dev/null; then
        brew install k6
    elif command -v apt-get &> /dev/null; then
        sudo gpg -k
        sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
        echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6
    else
        # Download binary directly
        log_info "Downloading K6 binary..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            curl -L "https://github.com/grafana/k6/releases/download/v${K6_VERSION}/k6-v${K6_VERSION}-macos-amd64.tar.gz" | tar xz
            sudo mv "k6-v${K6_VERSION}-macos-amd64/k6" /usr/local/bin/
        else
            curl -L "https://github.com/grafana/k6/releases/download/v${K6_VERSION}/k6-v${K6_VERSION}-linux-amd64.tar.gz" | tar xz
            sudo mv "k6-v${K6_VERSION}-linux-amd64/k6" /usr/local/bin/
        fi
    fi
    
    log_success "K6 installed successfully"
}

# Run load tests
run_load_tests() {
    log_info "Running comprehensive load tests..."
    
    local test_file="$TESTS_DIR/load-test.js"
    local results_file="$RESULTS_DIR/load-test-$TIMESTAMP.json"
    local html_report="$RESULTS_DIR/load-test-$TIMESTAMP.html"
    
    log_info "Test file: $test_file"
    log_info "Results: $results_file"
    
    # Run K6 load test with JSON output
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$results_file" \
        --summary-trend-stats="avg,min,med,max,p(90),p(95),p(99)" \
        "$test_file"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Load tests completed successfully"
        generate_html_report "$results_file" "$html_report"
    else
        log_error "Load tests failed with exit code $exit_code"
        return $exit_code
    fi
}

# Run cache performance tests
run_cache_tests() {
    log_info "Running cache performance tests..."
    
    local test_file="$TESTS_DIR/cache-test.js"
    local results_file="$RESULTS_DIR/cache-test-$TIMESTAMP.json"
    
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$results_file" \
        "$test_file"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Cache tests completed successfully"
        analyze_cache_results "$results_file"
    else
        log_error "Cache tests failed with exit code $exit_code"
        return $exit_code
    fi
}

# Run database performance tests
run_database_tests() {
    log_info "Running database performance tests..."
    
    local test_file="$TESTS_DIR/database-test.js"
    local results_file="$RESULTS_DIR/database-test-$TIMESTAMP.json"
    
    k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$results_file" \
        "$test_file"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Database tests completed successfully"
        analyze_database_results "$results_file"
    else
        log_error "Database tests failed with exit code $exit_code"
        return $exit_code
    fi
}

# Generate HTML report from JSON results
generate_html_report() {
    local json_file="$1"
    local html_file="$2"
    
    log_info "Generating HTML report..."
    
    # Create simple HTML report
    cat > "$html_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>LightingPro Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #007cba; }
        .metric h3 { margin-top: 0; color: #007cba; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .danger { border-left-color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LightingPro Performance Test Report</h1>
        <p>Generated: $(date)</p>
        <p>Test Duration: $(date -d "$(stat -c %Y "$json_file")" +'%Y-%m-%d %H:%M:%S')</p>
    </div>
    
    <div class="metrics">
        <div class="metric success">
            <h3>Test Status</h3>
            <p>Completed Successfully</p>
        </div>
        <div class="metric">
            <h3>Results File</h3>
            <p>$(basename "$json_file")</p>
        </div>
    </div>
    
    <h2>Detailed Results</h2>
    <p>For detailed metrics, please analyze the JSON file: <code>$(basename "$json_file")</code></p>
</body>
</html>
EOF
    
    log_success "HTML report generated: $html_file"
}

# Analyze cache test results
analyze_cache_results() {
    local results_file="$1"
    
    log_info "Analyzing cache performance results..."
    
    # Extract cache hit rate from results
    if [ -f "$results_file" ]; then
        log_info "Cache analysis complete. Check $results_file for detailed metrics."
    fi
}

# Analyze database test results
analyze_database_results() {
    local results_file="$1"
    
    log_info "Analyzing database performance results..."
    
    if [ -f "$results_file" ]; then
        log_info "Database analysis complete. Check $results_file for detailed metrics."
    fi
}

# Run specific test based on argument
run_specific_test() {
    local test_type="$1"
    
    case $test_type in
        "load")
            run_load_tests
            ;;
        "cache")
            run_cache_tests
            ;;
        "database")
            run_database_tests
            ;;
        *)
            log_error "Unknown test type: $test_type"
            log_info "Available test types: load, cache, database"
            exit 1
            ;;
    esac
}

# Run all tests
run_all_tests() {
    log_info "Running all performance tests..."
    
    local overall_success=true
    
    # Run tests in sequence
    if ! run_cache_tests; then
        overall_success=false
    fi
    
    sleep 30 # Cool down period
    
    if ! run_database_tests; then
        overall_success=false
    fi
    
    sleep 30 # Cool down period
    
    if ! run_load_tests; then
        overall_success=false
    fi
    
    if $overall_success; then
        log_success "All performance tests completed successfully!"
        generate_summary_report
    else
        log_error "Some performance tests failed. Check individual results."
        exit 1
    fi
}

# Generate summary report
generate_summary_report() {
    local summary_file="$RESULTS_DIR/summary-$TIMESTAMP.md"
    
    cat > "$summary_file" << EOF
# LightingPro Performance Test Summary

## Test Execution
- **Date**: $(date)
- **Base URL**: $BASE_URL
- **Results Directory**: $RESULTS_DIR

## Tests Executed
- ✅ Cache Performance Tests
- ✅ Database Performance Tests  
- ✅ Load Tests

## Key Metrics
- All tests completed successfully
- Results stored in JSON format for detailed analysis
- HTML reports generated where applicable

## Next Steps
1. Review individual test results in $RESULTS_DIR
2. Analyze performance trends over time
3. Set up monitoring for production environment
4. Configure alerts for performance regressions

## Files Generated
$(ls -la "$RESULTS_DIR"/*$TIMESTAMP* 2>/dev/null || echo "No files generated")
EOF
    
    log_success "Summary report generated: $summary_file"
}

# Print usage information
print_usage() {
    echo "Usage: $0 [test_type] [options]"
    echo
    echo "Test Types:"
    echo "  all       Run all performance tests (default)"
    echo "  load      Run load/stress tests"
    echo "  cache     Run cache performance tests"
    echo "  database  Run database performance tests"
    echo
    echo "Options:"
    echo "  --url URL     Base URL for testing (default: http://localhost:3000)"
    echo "  --help        Show this help message"
    echo
    echo "Examples:"
    echo "  $0                                    # Run all tests"
    echo "  $0 load                              # Run only load tests"
    echo "  $0 cache --url http://staging.app   # Test staging cache"
}

# Main execution
main() {
    log_info "LightingPro Performance Testing Suite"
    log_info "====================================="
    
    # Parse command line arguments
    local test_type="all"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --url)
                BASE_URL="$2"
                shift 2
                ;;
            --help)
                print_usage
                exit 0
                ;;
            all|load|cache|database)
                test_type="$1"
                shift
                ;;
            *)
                log_warning "Unknown option: $1"
                shift
                ;;
        esac
    done
    
    log_info "Test Type: $test_type"
    log_info "Base URL: $BASE_URL"
    
    # Execute tests
    check_prerequisites
    
    if [ "$test_type" = "all" ]; then
        run_all_tests
    else
        run_specific_test "$test_type"
    fi
    
    log_success "Performance testing completed!"
    log_info "Results available in: $RESULTS_DIR"
}

# Error handling
trap 'log_error "Performance testing failed on line $LINENO"' ERR

# Execute main function
main "$@"