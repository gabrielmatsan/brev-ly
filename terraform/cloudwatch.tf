# CloudWatch Log Group para ECS
resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name              = "/ecs/${var.application_name}"
  retention_in_days = 30

  tags = {
    Name        = "${var.application_name}-ecs-logs"
    Environment = var.environment
    IAC         = "true"
  }
}

# CloudWatch Log Group para ALB
resource "aws_cloudwatch_log_group" "alb_log_group" {
  name              = "/aws/alb/${var.application_name}"
  retention_in_days = 14

  tags = {
    Name        = "${var.application_name}-alb-logs"
    Environment = var.environment
    IAC         = "true"
  }
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_alarm" {
  alarm_name = "${var.application_name}-ecs-memory-alarm" # nome do alarme

  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"                 # 2 períodos para avaliar a métrica
  metric_name         = "MemoryReservation" # métrica de memória reservada
  namespace           = "AWS/ECS"           # namespace da métrica
  period              = "60"                # período de 1 minuto
  statistic           = "Average"           # média
  threshold           = "75"                # limite de 75% de memória reservada
  #alarm_actions = [aws_sns_topic.ecs_memory_alarm.arn] # ação do alarme, no caso, o SNS

  dimensions = {
    ClusterName = aws_ecs_cluster.ecs-cluster.name # cluster do ecs
    ServiceName = aws_ecs_service.ecs-service.name # serviço do ecs
  }

  alarm_description = "This metric monitors the memory reservation of the ECS service"

  tags = {
    Name = "${var.application_name}-ecs-memory-alarm-cloudwatch"
    IAC  = "true"
  }

  depends_on = [aws_ecs_cluster.ecs-cluster, aws_ecs_service.ecs-service]
}

# erro em application load balancer
resource "aws_cloudwatch_metric_alarm" "alb_error_alarm" {
  alarm_name = "${var.application_name}-alb-error-alarm"

  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_ELB_5xx_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "10"

  dimensions = {
    LoadBalancer = aws_lb.alb.name
  }

  alarm_description = "This metric monitors the error count of the ALB"

  tags = {
    Name = "${var.application_name}-alb-error-alarm-cloudwatch"
    IAC  = "true"
  }

  depends_on = [aws_lb.alb]
}