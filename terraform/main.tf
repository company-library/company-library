terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.51.0"
    }
  }
}

variable "project_id" {}

provider "google" {
  credentials = file("key.json")

  project = var.project_id
  region  = "asia-northeast1"
  zone    = "asia-northeast1-a"
}

resource "google_compute_network" "vpc_network" {
  name = "terraform-network"
}

resource "google_sql_database_instance" "company-library" {
  name             = "cl-db"
  database_version = "POSTGRES_14"
  region           = "asia-northeast1"

  settings {
    # Second-generation instance tiers are based on the machine
    # type. See argument reference below.
    tier = "db-f1-micro"
  }
}

resource "google_vpc_access_connector" "company-library" {
  name          = "cl-vpc-con"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc_network.id
}

variable "db_user" {}
variable "db_pass" {}
variable "db_name" {}

resource "google_cloud_run_service" "company-library-hasura" {
  name     = "cl-hasura"
  location = "asia-northeast1"

  template {
    spec {
      containers {
        image = "hasura/graphql-engine:v2.24.1"
        env {
          name  = "HASURA_GRAPHQL_DATABASE_URL"
          value = "postgres://${var.db_user}:${var.db_pass}@${google_sql_database_instance.company-library.private_ip_address}:5432/${var.db_name}"
        }
        env {
          name  = "HASURA_GRAPHQL_ENABLE_CONSOLE"
          value = "true"
        }
        env {
          name  = "PG_DATABASE_URL"
          value = "postgres://${var.db_user}:${var.db_pass}@${google_sql_database_instance.company-library.private_ip_address}:5432/${var.db_name}"
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "100"
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.company-library.id
        "run.googleapis.com/client-name"        = "terraform"
      }
    }
  }
  autogenerate_revision_name = true
}
