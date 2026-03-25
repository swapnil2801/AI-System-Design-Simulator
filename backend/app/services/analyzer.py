"""Architecture analyzer -- produces warnings and improvement suggestions."""

from __future__ import annotations

from typing import Any


def analyze_architecture(
    nodes: list[dict[str, Any]],
    edges: list[dict[str, Any]],
) -> dict[str, list[str]]:
    """Analyze an architecture graph and return actionable feedback.

    Returns::

        {
            "warnings": [...],
            "suggestions": [...],
        }
    """
    warnings: list[str] = []
    suggestions: list[str] = []

    # Collect node types present in the architecture
    node_types: set[str] = {n.get("node_type", "") for n in nodes}
    type_counts: dict[str, int] = {}
    for n in nodes:
        nt = n.get("node_type", "")
        type_counts[nt] = type_counts.get(nt, 0) + 1

    has_database = "Database" in node_types
    has_cache = "Cache" in node_types
    has_load_balancer = "Load Balancer" in node_types
    has_cdn = "CDN" in node_types
    has_client = "Client" in node_types
    has_message_queue = "Message Queue" in node_types
    has_api_gateway = "API Gateway" in node_types
    has_firewall = "Firewall" in node_types
    has_monitoring = "Monitoring" in node_types
    has_auth_service = "Auth Service" in node_types
    has_search_engine = "Search Engine" in node_types
    has_dns_server = "DNS Server" in node_types
    has_microservice = "Microservice" in node_types

    microservice_count = type_counts.get("Microservice", 0)
    database_count = type_counts.get("Database", 0)
    service_count = microservice_count  # used for readability below

    # -----------------------------------------------------------------------
    # Rule: Database without Cache -> suggest Redis cache
    # -----------------------------------------------------------------------
    if has_database and not has_cache:
        suggestions.append(
            "Consider adding a Cache (e.g., Redis) in front of your Database "
            "to reduce read latency and offload repetitive queries."
        )

    # -----------------------------------------------------------------------
    # Rule: No Load Balancer + multiple services -> suggest Load Balancer
    # -----------------------------------------------------------------------
    if not has_load_balancer and microservice_count > 1:
        suggestions.append(
            "Multiple Microservices detected without a Load Balancer. "
            "Adding a Load Balancer will distribute traffic evenly and "
            "improve fault tolerance."
        )

    # -----------------------------------------------------------------------
    # Rule: No CDN + Client exists -> suggest CDN
    # -----------------------------------------------------------------------
    if has_client and not has_cdn:
        suggestions.append(
            "No CDN detected. Adding a CDN will reduce latency for static "
            "assets and decrease load on your backend services."
        )

    # -----------------------------------------------------------------------
    # Rule: No Message Queue + multiple Microservices -> suggest async messaging
    # -----------------------------------------------------------------------
    if not has_message_queue and microservice_count > 1:
        suggestions.append(
            "Multiple Microservices without a Message Queue may lead to tight "
            "coupling. Consider adding asynchronous messaging (e.g., RabbitMQ "
            "or Kafka) to decouple services and improve resilience."
        )

    # -----------------------------------------------------------------------
    # Rule: Single Database + high service count -> warn about DB bottleneck
    # -----------------------------------------------------------------------
    if database_count == 1 and service_count >= 3:
        warnings.append(
            "A single Database is serving {} Microservices. This is likely to "
            "become a bottleneck under load. Consider read replicas or "
            "splitting into service-specific databases.".format(service_count)
        )

    # -----------------------------------------------------------------------
    # Rule: No API Gateway -> suggest API Gateway
    # -----------------------------------------------------------------------
    if not has_api_gateway:
        suggestions.append(
            "No API Gateway found. An API Gateway centralises cross-cutting "
            "concerns such as authentication, rate limiting, and request "
            "routing."
        )

    # -----------------------------------------------------------------------
    # Rule: No Firewall -> suggest adding a Firewall for security
    # -----------------------------------------------------------------------
    if not has_firewall:
        suggestions.append(
            "No Firewall detected. Adding a Firewall will help protect your "
            "infrastructure from unauthorized access and malicious traffic."
        )

    # -----------------------------------------------------------------------
    # Rule: No Monitoring -> suggest adding Monitoring/Observability
    # -----------------------------------------------------------------------
    if not has_monitoring:
        suggestions.append(
            "No Monitoring component detected. Adding Monitoring/Observability "
            "(e.g., Prometheus, Datadog) is essential for tracking system health, "
            "performance, and alerting on issues."
        )

    # -----------------------------------------------------------------------
    # Rule: No Auth Service + Microservices exist -> suggest centralized auth
    # -----------------------------------------------------------------------
    if not has_auth_service and has_microservice:
        suggestions.append(
            "Microservices detected without a centralized Auth Service. Consider "
            "adding an Auth Service (e.g., OAuth2/OIDC provider) to manage "
            "authentication and authorization across services."
        )

    # -----------------------------------------------------------------------
    # Rule: Multiple Databases but no Search Engine -> suggest search engine
    # -----------------------------------------------------------------------
    if database_count > 1 and not has_search_engine:
        suggestions.append(
            "Multiple Databases detected without a Search Engine. Consider adding "
            "a Search Engine (e.g., Elasticsearch) to handle complex queries and "
            "full-text search across your data stores."
        )

    # -----------------------------------------------------------------------
    # Rule: No DNS Server + CDN exists -> suggest DNS for routing
    # -----------------------------------------------------------------------
    if not has_dns_server and has_cdn:
        suggestions.append(
            "A CDN is present but no DNS Server is configured. Adding a DNS Server "
            "(e.g., Route 53, Cloud DNS) will enable intelligent traffic routing "
            "and failover capabilities."
        )

    return {"warnings": warnings, "suggestions": suggestions}
