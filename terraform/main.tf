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
  name             = "company-library-db"
  database_version = "POSTGRES_14"
  region           = "asia-northeast1"

  settings {
    # Second-generation instance tiers are based on the machine
    # type. See argument reference below.
    tier = "db-f1-micro"
  }
}
