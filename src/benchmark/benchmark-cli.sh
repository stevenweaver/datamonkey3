#!/bin/bash
#
# CLI HyPhy Benchmark Script
#
# Runs native HyPhy (CLI) benchmarks for comparison with WASM browser performance.
# Results are saved in JSON and CSV formats for analysis.
#
# Requirements:
#   - HyPhy installed (brew install hyphy or compiled from source)
#   - jq for JSON processing (brew install jq)
#   - bc for floating point math
#
# Usage:
#   ./benchmark-cli.sh                    # Run default benchmarks
#   ./benchmark-cli.sh --alignments tiny,small --methods fel,meme
#   ./benchmark-cli.sh --iterations 10    # More iterations for better statistics
#
# Output:
#   benchmark-results/cli-results-TIMESTAMP.json
#   benchmark-results/cli-results-TIMESTAMP.csv
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALIGNMENTS_DIR="$SCRIPT_DIR/test-alignments"
OUTPUT_DIR="$SCRIPT_DIR/../../benchmark-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Default settings
DEFAULT_ALIGNMENTS="tiny small medium"
DEFAULT_METHODS="fel meme slac"
DEFAULT_ITERATIONS=5

# Parse arguments
ALIGNMENTS="${DEFAULT_ALIGNMENTS}"
METHODS="${DEFAULT_METHODS}"
ITERATIONS="${DEFAULT_ITERATIONS}"

while [[ $# -gt 0 ]]; do
    case $1 in
        --alignments)
            ALIGNMENTS="${2//,/ }"
            shift 2
            ;;
        --methods)
            METHODS="${2//,/ }"
            shift 2
            ;;
        --iterations)
            ITERATIONS="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --alignments LIST  Comma-separated list of alignments (default: $DEFAULT_ALIGNMENTS)"
            echo "  --methods LIST     Comma-separated list of methods (default: $DEFAULT_METHODS)"
            echo "  --iterations N     Number of iterations per test (default: $DEFAULT_ITERATIONS)"
            echo ""
            echo "Available alignments: tiny small medium-narrow medium medium-wide large-narrow large xlarge"
            echo "Available methods: fel meme slac"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check for required tools
check_dependencies() {
    echo "Checking dependencies..."

    if ! command -v hyphy &> /dev/null; then
        echo "Error: HyPhy is not installed."
        echo "Install with: brew install hyphy"
        echo "Or build from source: https://github.com/veg/hyphy"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        echo "Error: jq is not installed."
        echo "Install with: brew install jq"
        exit 1
    fi

    if ! command -v bc &> /dev/null; then
        echo "Error: bc is not installed."
        echo "Install with: brew install bc"
        exit 1
    fi

    echo "  HyPhy: $(hyphy --version 2>&1 | head -1)"
    echo "  jq: $(jq --version)"
    echo "  bc: available"
}

# Get system info
get_system_info() {
    local cores=$(sysctl -n hw.ncpu 2>/dev/null || nproc 2>/dev/null || echo "0")
    local memory_bytes=$(sysctl -n hw.memsize 2>/dev/null || free -b 2>/dev/null | awk '/Mem:/{print $2}' || echo "0")
    local memory_gb=$(echo "scale=1; $memory_bytes / 1073741824" | bc)
    # Fix leading decimal point
    if [[ "$memory_gb" == .* ]]; then
        memory_gb="0$memory_gb"
    fi
    local os=$(uname -s)
    local os_version=$(uname -r)
    local arch=$(uname -m)
    local hyphy_version=$(hyphy --version 2>&1 | head -1)

    echo "{
        \"cores\": $cores,
        \"memoryGB\": $memory_gb,
        \"os\": \"$os\",
        \"osVersion\": \"$os_version\",
        \"arch\": \"$arch\",
        \"hyphyVersion\": \"$hyphy_version\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }"
}

# Fix bc output to be valid JSON numbers (add leading 0 for decimals)
fix_number() {
    local num="$1"
    # Handle negative numbers starting with -.
    if [[ "$num" == -.* ]]; then
        echo "-0${num:1}"
    # Handle positive numbers starting with .
    elif [[ "$num" == .* ]]; then
        echo "0$num"
    else
        echo "$num"
    fi
}

# Calculate statistics from array of times
calculate_stats() {
    local times=("$@")
    local n=${#times[@]}

    if [ $n -eq 0 ]; then
        echo '{"n":0,"mean":0,"stdDev":0,"standardError":0,"ci95":[0,0],"min":0,"max":0,"median":0,"cv":0}'
        return
    fi

    # Calculate mean
    local sum=0
    for t in "${times[@]}"; do
        sum=$(echo "$sum + $t" | bc -l)
    done
    local mean=$(fix_number "$(echo "scale=6; $sum / $n" | bc -l)")

    # Calculate variance and std dev
    local variance_sum=0
    for t in "${times[@]}"; do
        local diff=$(echo "$t - $mean" | bc -l)
        variance_sum=$(echo "$variance_sum + ($diff * $diff)" | bc -l)
    done
    local variance=$(echo "scale=6; $variance_sum / ($n - 1)" | bc -l 2>/dev/null || echo "0")
    local std_dev=$(fix_number "$(echo "scale=6; sqrt($variance)" | bc -l 2>/dev/null || echo "0")")

    # Standard error
    local se=$(fix_number "$(echo "scale=6; $std_dev / sqrt($n)" | bc -l)")

    # 95% CI
    local ci_low=$(fix_number "$(echo "scale=6; $mean - 1.96 * $se" | bc -l)")
    local ci_high=$(fix_number "$(echo "scale=6; $mean + 1.96 * $se" | bc -l)")

    # Sort for min, max, median
    local sorted=($(printf '%s\n' "${times[@]}" | sort -n))
    local min=${sorted[0]}
    local max=${sorted[$((n-1))]}
    local median
    if [ $((n % 2)) -eq 0 ]; then
        local mid=$((n / 2))
        median=$(fix_number "$(echo "scale=6; (${sorted[$((mid-1))]} + ${sorted[$mid]}) / 2" | bc -l)")
    else
        median=${sorted[$((n / 2))]}
    fi

    # CV
    local cv=$(fix_number "$(echo "scale=6; ($std_dev / $mean) * 100" | bc -l 2>/dev/null || echo "0")")

    echo "{\"n\":$n,\"mean\":$mean,\"stdDev\":$std_dev,\"standardError\":$se,\"ci95\":[$ci_low,$ci_high],\"min\":$min,\"max\":$max,\"median\":$median,\"cv\":$cv}"
}

# Run single benchmark
run_benchmark() {
    local alignment=$1
    local method=$2
    local alignment_file="$ALIGNMENTS_DIR/${alignment}.nex"

    if [ ! -f "$alignment_file" ]; then
        echo "  Warning: Alignment file not found: $alignment_file" >&2
        return 1
    fi

    # Get alignment info from filename patterns
    local sequences sites
    case $alignment in
        tiny) sequences=10; sites=150 ;;
        small) sequences=25; sites=300 ;;
        medium-narrow) sequences=50; sites=201 ;;
        medium) sequences=50; sites=501 ;;
        medium-wide) sequences=25; sites=999 ;;
        large-narrow) sequences=100; sites=300 ;;
        large) sequences=100; sites=600 ;;
        xlarge) sequences=200; sites=450 ;;
        *) sequences=0; sites=0 ;;
    esac

    echo "  Running $method on $alignment ($sequences seq x $sites sites)..." >&2

    local times=()
    local iterations_json="["
    local temp_dir=$(mktemp -d)

    for i in $(seq 1 $ITERATIONS); do
        echo -n "    Iteration $i/$ITERATIONS... " >&2

        # Copy alignment to temp dir to avoid conflicts
        cp "$alignment_file" "$temp_dir/input.nex"

        # Time the execution (in milliseconds)
        local start_time=$(python3 -c 'import time; print(int(time.time() * 1000))')

        # Run HyPhy (use LIBPATH from environment or default to common locations)
        local libpath="${HYPHY_LIBPATH:-/Users/sweaver/Programming/_bioinformatics/hyphy/hyphy/res/}"
        hyphy LIBPATH="$libpath" "$method" --alignment "$temp_dir/input.nex" > "$temp_dir/output.log" 2>&1
        local exit_code=$?

        local end_time=$(python3 -c 'import time; print(int(time.time() * 1000))')
        local duration=$((end_time - start_time))

        if [ $exit_code -eq 0 ]; then
            times+=($duration)
            echo "${duration}ms" >&2

            # Store iteration result
            [ $i -gt 1 ] && iterations_json+=","
            iterations_json+="{\"iteration\":$i,\"runtimeMs\":$duration,\"success\":true}"

            # Save first successful JSON result for concordance checking
            if [ $i -eq 1 ]; then
                local method_upper=$(echo "$method" | tr '[:lower:]' '[:upper:]')
                local result_file="$temp_dir/input.nex.${method_upper}.json"
                if [ -f "$result_file" ]; then
                    cp "$result_file" "$OUTPUT_DIR/sample-cli-${alignment}-${method}.json"
                fi
            fi
        else
            echo "FAILED" >&2
            [ $i -gt 1 ] && iterations_json+=","
            iterations_json+="{\"iteration\":$i,\"runtimeMs\":0,\"success\":false,\"error\":\"Exit code $exit_code\"}"
        fi
    done

    iterations_json+="]"

    # Clean up
    rm -rf "$temp_dir"

    # Calculate statistics
    local stats=$(calculate_stats "${times[@]}")

    # Build result JSON (single line to avoid parsing issues)
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local result="{\"platform\":\"cli\",\"browser\":null,\"method\":\"$method\",\"alignment\":\"$alignment\",\"sequences\":$sequences,\"sites\":$sites,\"iterations\":$iterations_json,\"statistics\":$stats,\"timestamp\":\"$timestamp\"}"

    echo "$result"
}

# Main execution
main() {
    echo "============================================"
    echo "HyPhy CLI Benchmark Suite"
    echo "============================================"
    echo ""

    check_dependencies
    echo ""

    # Create output directory
    mkdir -p "$OUTPUT_DIR"

    # Get system info
    echo "Collecting system information..."
    local system_info=$(get_system_info)
    echo "  Cores: $(echo "$system_info" | jq -r '.cores')"
    echo "  Memory: $(echo "$system_info" | jq -r '.memoryGB') GB"
    echo "  OS: $(echo "$system_info" | jq -r '.os') $(echo "$system_info" | jq -r '.osVersion')"
    echo "  HyPhy: $(echo "$system_info" | jq -r '.hyphyVersion')"
    echo ""

    echo "Benchmark Configuration:"
    echo "  Alignments: $ALIGNMENTS"
    echo "  Methods: $METHODS"
    echo "  Iterations: $ITERATIONS"
    echo ""

    # Initialize results array
    local results="["
    local first_result=true

    # CSV header
    local csv_file="$OUTPUT_DIR/cli-results-$TIMESTAMP.csv"
    echo "platform,browser,alignment,sequences,sites,method,replicate,runtime_ms,mean_ms,se_ms,ci95_low,ci95_high" > "$csv_file"

    # Run benchmarks
    for alignment in $ALIGNMENTS; do
        for method in $METHODS; do
            echo ""
            local result=$(run_benchmark "$alignment" "$method")

            if [ -n "$result" ]; then
                # Add to JSON results
                if [ "$first_result" = true ]; then
                    first_result=false
                else
                    results+=","
                fi
                results+="$result"

                # Add to CSV
                local stats=$(echo "$result" | jq '.statistics')
                local mean=$(echo "$stats" | jq '.mean')
                local se=$(echo "$stats" | jq '.standardError')
                local ci95_low=$(echo "$stats" | jq '.ci95[0]')
                local ci95_high=$(echo "$stats" | jq '.ci95[1]')
                local sequences=$(echo "$result" | jq '.sequences')
                local sites=$(echo "$result" | jq '.sites')

                echo "$result" | jq -r '.iterations[] | select(.success==true) | .iteration' | while read iter; do
                    local runtime=$(echo "$result" | jq -r ".iterations[$((iter-1))].runtimeMs")
                    echo "cli,native,$alignment,$sequences,$sites,$method,$iter,$runtime,$mean,$se,$ci95_low,$ci95_high" >> "$csv_file"
                done
            fi
        done
    done

    results+="]"

    # Save combined JSON results
    local json_file="$OUTPUT_DIR/cli-results-$TIMESTAMP.json"
    echo "{
        \"version\": \"1.0.0\",
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"system\": $system_info,
        \"config\": {
            \"alignments\": \"$ALIGNMENTS\",
            \"methods\": \"$METHODS\",
            \"iterations\": $ITERATIONS
        },
        \"results\": $results
    }" | jq '.' > "$json_file"

    echo ""
    echo "============================================"
    echo "Benchmark Complete!"
    echo "============================================"
    echo ""
    echo "Results saved to:"
    echo "  JSON: $json_file"
    echo "  CSV:  $csv_file"
    echo ""

    # Print summary
    echo "Summary:"
    echo "$results" | jq -r '.[] | "  \(.method | ascii_upcase) on \(.alignment): mean=\(.statistics.mean | floor)ms, SE=\(.statistics.standardError | . * 100 | floor / 100)ms"'
}

main "$@"
