module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "6.0.1"

  name = "${var.application_name}-vpc"
  cidr = "10.0.0.0/16"

  azs = ["${var.aws_region}a", "${var.aws_region}b"] # 2 AZs na região (a e b)

  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]     # 2 subnets privadas
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"] # 2 subnets públicas

  enable_nat_gateway = true
  single_nat_gateway = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = var.environment
    Name        = "${var.application_name}-vpc"
    IAC         = "true"
  }
}