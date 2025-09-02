#!/bin/bash

set -euo pipefail
# -e: aborta o script se um comando falhar
# -u: aborta o script se uma variável não for definida
# -o pipefail: aborta o script se um comando na pipeline falhar

# ecs dados
CLUSTER_NAME="brev-ly-ecs-cluster"
SERVICE_NAME="brev-ly-ecs-service"
AWS_REGION="us-east-1"

# colors to output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'


log() {
    local level=$1; shift
    case $level in
        "ERROR")   echo -e "${RED}❌ $*${NC}" >&2 ;;
        "SUCCESS") echo -e "${GREEN}✅ $*${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️ $*${NC}" ;;
        "INFO")    echo -e "${BLUE}ℹ️ $*${NC}" ;;
    esac
}



echo "Envs: $CLUSTER_NAME, $SERVICE_NAME, $AWS_REGION"

# function para verificar se existe na aws
function check_if_exists_in_aws() {
   current_task_def=$(aws ecs describe-services \
        --cluster "$CLUSTER_NAME" \
        --services "$SERVICE_NAME" \
        --region "$AWS_REGION" \
        --query "services[0].taskDefinition" \
        --output text 2>/dev/null)

  if [ "$current_task_def" != "None" ] && [ -n "$current_task_def" ]; then
    return 0
  else
    return 1
  fi

  
}


main() {
  if check_if_exists_in_aws; then
    log "SUCCESS" "Service $SERVICE_NAME exists in cluster $CLUSTER_NAME"
  else
    log "ERROR" "Service $SERVICE_NAME does not exist in cluster $CLUSTER_NAME"
  fi
}

main
