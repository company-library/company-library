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

variable "db_user" {}
variable "db_pass" {}
variable "db_name" {}

resource "google_compute_global_address" "private_ip_address" {
  provider = google

  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  provider = google

  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}


resource "google_sql_database_instance" "company-library" {
  name             = "cl-db"
  database_version = "POSTGRES_14"
  region           = "asia-northeast1"

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc_network.id
    }
  }
}

resource "google_sql_database" "company-library" {
  name     = var.db_name
  instance = google_sql_database_instance.company-library.name
}

resource "google_sql_user" "users" {
  name     = var.db_user
  instance = google_sql_database_instance.company-library.name
  password = var.db_pass
}


resource "google_vpc_access_connector" "company-library" {
  name          = "cl-vpc-con"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc_network.id
}

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
        "autoscaling.knative.dev/maxScale"        = "100"
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.company-library.id
        "run.googleapis.com/client-name"          = "terraform"
      }
    }
  }
  autogenerate_revision_name = true
}
