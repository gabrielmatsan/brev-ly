resource "aws_security_group" "alb" { # alb = Application Load Balancer
  name = "${var.application_name}-alb-sg"

  vpc_id = module.vpc.vpc_id

  ingress {
    from_port   = 80            # Porta 80 (HTTP)
    to_port     = 80            # Apenas porta 80
    protocol    = "tcp"         # Protocolo TCP
    cidr_blocks = ["0.0.0.0/0"] # Qualquer IP da internet
  }
  # Qualquer pessoa da internet pode acessar meu ALB na porta 80 (HTTP)

  ingress {
    from_port   = 443           # Porta 443 (HTTPS)
    to_port     = 443           # Apenas porta 443
    protocol    = "tcp"         # Protocolo TCP
    cidr_blocks = ["0.0.0.0/0"] # Qualquer IP da internet
  }
  #Qualquer pessoa da internet pode acessar meu ALB na porta 443 (HTTPS)

  egress {
    from_port   = 0             # Qualquer porta de origem
    to_port     = 0             # Qualquer porta de destino
    protocol    = "-1"          # Qualquer protocolo
    cidr_blocks = ["0.0.0.0/0"] # Para qualquer lugar
  }
  # Load Balancer pode acessar qualquer lugar


  tags = {
    Name        = "${var.application_name}-alb-sg"
    Environment = var.environment
    IAC         = "true"
  }
}


resource "aws_security_group" "ecs" {
  name = "${var.application_name}-ecs-sg"

  vpc_id = module.vpc.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

 // ingress {
 //   from_port       = 443
 //   to_port         = 443
 //   protocol        = "tcp"
 //   security_groups = [aws_security_group.alb.id]
 // }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.application_name}-ecs-sg"
    Environment = var.environment
    IAC         = "true"
  }
}