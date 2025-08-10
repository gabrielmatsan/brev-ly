resource "aws_lb" "alb" {
  name            = "${var.application_name}-alb"
  internal        = false # publico
  security_groups = [aws_security_group.alb.id]
  subnets         = module.vpc.public_subnets

  enable_deletion_protection = false # caso fosse um produto real, seria true 

  tags = {
    Name        = "${var.application_name}-alb"
    Environment = var.environment
    IAC         = "true"
  }
}


resource "aws_lb_target_group" "alb-target-group" {
  name        = "${var.application_name}-alb-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"


  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = 8080
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "${var.application_name}-alb-tg"
    Environment = var.environment
    IAC         = "true"
  }
}


resource "aws_lb_listener" "alb-listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  region = var.aws_region

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}


