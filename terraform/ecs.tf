resource "aws_ecs_cluster" "ecs-cluster" {
  name = "${var.application_name}-ecs-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.application_name}-ecs-cluster"
    IAC  = "true"
  }
}


# criar iam role para o ecs

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.application_name}-ecs-task-execution-role"


  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })


  tags = {
    Name = "${var.application_name}-ecs-task-execution-role"
    IAC  = "true"
  }
}


resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}



resource "aws_ecs_task_definition" "ecs-task-definition" {
  family                   = "${var.application_name}-ecs-task-definition"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn


  container_definitions = jsonencode([
    {
      name      = "${var.application_name}-ecs-task-definition"
      image     = "ghcr.io/gabrielmatsan/brev-ly:latest"
      essential = true # se o container falhar, a tarefa falha

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      repositoryCredentials = {
        credentialsParameter = "arn:aws:secretsmanager:us-east-1:123456789012:secret:my-secret-name"
      }


      tags = {
        Name = "${var.application_name}-ecs-task-definition"
        IAC  = "true"
      }
    }
  ])
}



resource "aws_ecs_service" "ecs-service" {
  name            = "${var.application_name}-ecs-service"
  cluster         = aws_ecs_cluster.ecs-cluster.id
  task_definition = aws_ecs_task_definition.ecs-task-definition.arn
  desired_count   = 1 # numero de containers
  launch_type     = "FARGATE"


  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 50

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb-target-group.arn
    container_name   = "${var.application_name}-ecs-task-definition"
    container_port   = 8080
  }


  depends_on = [aws_lb_listener.alb-listener-https]


  tags = {
    Name = "${var.application_name}-ecs-service"
    IAC  = "true"
  }
}