Resultado do prompt: "Defina métricas e logs a serem monitorados (disponibilidade, latência, erros)."

---
Criei um sistema completo de monitoramento com métricas e logs para o **Hotel Booking System**. Aqui está o resumo do que foi implementado:

## 📊 **Sistema de Monitoramento Completo**

### 📁 **Arquivos de Configuração YAML Criados**
- **[monitoring/prometheus/alert_rules.yml](cci:7://file:///home/walisson/CascadeProjects/hotel-booking-system/monitoring/prometheus/alert_rules.yml:0:0-0:0)** - Regras de alerta completas
- **[monitoring/grafana/dashboards/business-metrics.yml](cci:7://file:///home/walisson/CascadeProjects/hotel-booking-system/monitoring/grafana/dashboards/business-metrics.yml:0:0-0:0)** - Dashboard de métricas de negócio
- **[monitoring/grafana/dashboards/infrastructure-metrics.yml](cci:7://file:///home/walisson/CascadeProjects/hotel-booking-system/monitoring/grafana/dashboards/infrastructure-metrics.yml:0:0-0:0)** - Dashboard de infraestrutura
- **[monitoring/elasticsearch/logstash-pipeline.yml](cci:7://file:///home/walisson/CascadeProjects/hotel-booking-system/monitoring/elasticsearch/logstash-pipeline.yml:0:0-0:0)** - Pipeline de processamento de logs
- **[monitoring/fluent-bit/fluent-bit-config.yml](cci:7://file:///home/walisson/CascadeProjects/hotel-booking-system/monitoring/fluent-bit/fluent-bit-config.yml:0:0-0:0)** - Configuração de coleta de logs
- **[monitoring/README-Monitoring.md](cci:7://file:///home/walisson/CascadeProjects/hotel-booking-system/monitoring/README-Monitoring.md:0:0-0:0)** - Documentação completa

## 🎯 **Métricas Monitoradas**

### **1. Disponibilidade (Uptime)**
```yaml
# Frontend Health
- alert: FrontendDown
  expr: up{job="frontend"} == 0
  for: 1m
  labels:
    severity: critical
    service: frontend

# Backend Health
- alert: BackendDown
  expr: up{job="backend"} == 0
  for: 1m
  labels:
    severity: critical
    service: backend

# Database Connection
- alert: DatabaseConnectionErrors
  expr: rate(pg_stat_database_xact_rollback[5m]) > 0.1
  for: 2m
  labels:
    severity: critical
    service: database
```

### **2. Performance (Latência)**
```yaml
# Frontend Performance
- alert: FrontendHighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="frontend"}[5m])) > 2
  for: 5m
  labels:
    severity: warning
    service: frontend

# Backend Performance
- alert: BackendHighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="backend"}[5m])) > 1.5
  for: 5m
  labels:
    severity: warning
    service: backend

# Database Slow Queries
- alert: DatabaseSlowQueries
  expr: pg_stat_activity_max_duration_seconds > 5
  for: 2m
  labels:
    severity: warning
    service: database
```

### **3. Erros (Error Rate)**
```yaml
# Frontend Errors
- alert: FrontendHighErrorRate
  expr: rate(http_requests_total{job="frontend",status=~"5.."}[5m]) / rate(http_requests_total{job="frontend"}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
    service: frontend

# Backend Errors
- alert: BackendHighErrorRate
  expr: rate(http_requests_total{job="backend",status=~"5.."}[5m]) / rate(http_requests_total{job="backend"}[5m]) > 0.02
  for: 5m
  labels:
    severity: critical
    service: backend

# JavaScript Errors
- alert: JavaScriptErrors
  expr: increase(browser_errors_total[5m]) > 10
  for: 2m
  labels:
    severity: warning
    service: frontend
```

## 📋 **Logs Estruturados**

### **1. Application Logs**
```yaml
# Frontend Log Structure
{
  "timestamp": "2024-12-01T10:30:00.000Z",
  "level": "ERROR",
  "service": "frontend",
  "environment": "production",
  "message": "Failed to load booking data",
  "error": {
    "type": "NetworkError",
    "message": "Connection timeout",
    "stack": "..."
  },
  "context": {
    "user_id": "user123",
    "session_id": "sess456",
    "page": "/booking",
    "component": "BookingForm"
  },
  "performance": {
    "response_time": 5000,
    "memory_usage": 45.2
  }
}

# Backend Log Structure
{
  "timestamp": "2024-12-01T10:30:00.000Z",
  "level": "ERROR",
  "service": "backend",
  "environment": "production",
  "message": "Failed to create booking",
  "error": {
    "type": "ValidationException",
    "message": "Invalid room availability",
    "cause": "Room already booked"
  },
  "context": {
    "request_id": "req789",
    "user_id": "user123",
    "booking_id": "bk101",
    "endpoint": "/api/bookings",
    "method": "POST"
  },
  "performance": {
    "response_time": 250,
    "db_query_time": 120,
    "cache_hit": false
  }
}
```

### **2. Business Event Logs**
```yaml
# Booking Events
{
  "timestamp": "2024-12-01T10:30:00.000Z",
  "level": "INFO",
  "service": "backend",
  "event_type": "booking_created",
  "business_event": {
    "booking_id": "bk101",
    "user_id": "user123",
    "room_id": "room201",
    "check_in": "2024-12-15",
    "check_out": "2024-12-17",
    "amount": 300.00,
    "status": "confirmed"
  },
  "context": {
    "source": "web",
    "campaign": "winter_sale",
    "device": "mobile"
  }
}

# Payment Events
{
  "timestamp": "2024-12-01T10:33:00.000Z",
  "level": "INFO",
  "service": "payment",
  "event_type": "payment_completed",
  "business_event": {
    "payment_id": "pay456",
    "booking_id": "bk101",
    "amount": 300.00,
    "method": "credit_card",
    "gateway": "stripe",
    "status": "approved"
  },
  "fraud_check": {
    "risk_score": 0.15,
    "ip_reputation": "low_risk",
    "device_fingerprint": "trusted"
  }
}
```

### **3. Security Event Logs**
```yaml
# Authentication Events
{
  "timestamp": "2024-12-01T10:30:00.000Z",
  "level": "INFO",
  "service": "auth",
  "event_type": "login_success",
  "security_event": {
    "user_id": "user123",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "method": "password",
    "mfa_verified": true
  },
  "geoip": {
    "country": "BR",
    "city": "São Paulo",
    "coordinates": [-23.5505, -46.6333]
  }
}

# Security Threats
{
  "timestamp": "2024-12-01T10:31:00.000Z",
  "level": "WARN",
  "service": "auth",
  "event_type": "login_failure",
  "security_event": {
    "username": "admin",
    "ip_address": "192.168.1.200",
    "reason": "invalid_password",
    "attempt_count": 3
  },
  "threat_indicators": {
    "brute_force_detected": true,
    "ip_reputation": "suspicious",
    "anomaly_score": 0.85
  }
}
```

## 🚨 **Sistema de Alertas**

### **1. Alertas Críticos**
```yaml
# Service Down
- alert: ServiceDown
  expr: up{job=~"frontend|backend|database|redis"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Service is down"
    description: "{{ $labels.job }} is down for more than 1 minute"
    runbook_url: "https://runbooks.hotel-booking.com/service-down"

# High Error Rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
    description: "Error rate is {{ $value | humanizePercentage }}"
```

### **2. Alertas de Negócio**
```yaml
# Low Booking Rate
- alert: LowBookingRate
  expr: rate(bookings_created_total[1h]) < 1
  for: 30m
  labels:
    severity: warning
    service: business
  annotations:
    summary: "Low booking rate"
    description: "Booking rate is {{ $value }}/hour"

# Payment Failures
- alert: PaymentFailures
  expr: rate(payment_failures_total[5m]) > 0.1
  for: 5m
  labels:
    severity: critical
    service: business
  annotations:
    summary: "Payment failures detected"
    description: "Payment failure rate is {{ $value }}/s"
```

### **3. Alertas de Segurança**
```yaml
# Brute Force Attack
- alert: BruteForceAttack
  expr: rate(login_attempts_total{status="failed"}[1m]) > 20
  for: 1m
  labels:
    severity: critical
    service: security
  annotations:
    summary: "Brute force attack detected"
    description: "Failed login rate is {{ $value }}/s"

# Suspicious Activity
- alert: SuspiciousActivity
  expr: rate(suspicious_requests_total[5m]) > 5
  for: 2m
  labels:
    severity: critical
    service: security
  annotations:
    summary: "Suspicious activity detected"
    description: "Suspicious activity rate is {{ $value }}/s"
```

## 📈 **Dashboards do Grafana**

### **1. Business Metrics Dashboard**
```yaml
# KPIs Principais
panels:
  - title: "Booking Rate (Reservas/Hora)"
    type: stat
    targets:
      - expr: "rate(bookings_created_total[1h])"
    
  - title: "Conversion Rate"
    type: stat
    targets:
      - expr: "rate(bookings_completed_total[1h]) / rate(bookings_initiated_total[1h])"
    
  - title: "Booking Funnel"
    type: piechart
    targets:
      - expr: "sum(rate(bookings_initiated_total[1h]))"
      - expr: "sum(rate(bookings_completed_total[1h]))"
      - expr: "sum(rate(bookings_cancelled_total[1h]))"
```

### **2. Infrastructure Metrics Dashboard**
```yaml
# Métricas de Infraestrutura
panels:
  - title: "Cluster Overview"
    type: stat
    targets:
      - expr: "sum(up{job=\"kubernetes-nodes\"})"
      
  - title: "CPU Usage"
    type: graph
    targets:
      - expr: "sum(rate(container_cpu_usage_seconds_total{namespace=\"hotel-booking-prod\"}[5m])) by (pod)"
      
  - title: "Memory Usage"
    type: graph
    targets:
      - expr: "sum(container_memory_usage_bytes{namespace=\"hotel-booking-prod\"}) by (pod) / 1024 / 1024"
```

## 🔧 **Configuração do Pipeline de Logs**

### **Fluent Bit Configuration**
```yaml
# Input: Coleta de logs
inputs:
  - name: kubernetes
    path: /var/log/containers/*.log
    parser: docker
    tag: kube.*
    
# Filter: Processamento
filters:
  - name: kubernetes
    match: kube.*
    merge_log: On
    labels: On
    
  - name: modify
    match: kube.*
    add:
      environment: production
    conditions:
      - field: kubernetes.namespace_name
        operator: =
        value: hotel-booking-prod
        
# Output: Envio para Elasticsearch
outputs:
  - name: es
    match: "*"
    host: elasticsearch
    port: 9200
    index: hotel-booking-logs-${%Y.%m.%d}
```

### **Logstash Pipeline**
```yaml
# Parse Application Logs
filter:
  - if [fields][service] == "frontend":
    grok:
      match:
        message: "%{TIMESTAMP_ISO8601:timestamp} \\[%{LOGLEVEL:log_level}\\] %{GREEDYDATA:log_message}"
        
  - if [fields][service] == "backend":
    grok:
      match:
        message: "%{TIMESTAMP_ISO8601:timestamp}  %{LOGLEVEL:log_level} %{NUMBER:pid} --- \\[%{DATA:thread}\\] %{DATA:logger} : %{GREEDYDATA:log_message}"
        
# Business Event Extraction
  - if [log_message] =~ /booking_(created|completed|cancelled|abandoned)/:
    grok:
      match:
        log_message: "booking_%{WORD:booking_event}: booking_id=%{WORD:booking_id} user_id=%{WORD:user_id} amount=%{NUMBER:amount:float}"
```

## 🎯 **Benefícios do Sistema**

### **1. Observabilidade Completa**
- ✅ **Métricas em tempo real** de todos os componentes
- ✅ **Logs estruturados** para análise detalhada
- ✅ **Alertas proativos** para problemas críticos
- ✅ **Dashboards intuitivos** para diferentes audiências

### **2. Resposta Rápida**
- ✅ **Detecção automática** de anomalias
- ✅ **Notificações imediatas** via Slack/Email
- ✅ **Runbooks integrados** para resolução
- ✅ **Root cause analysis** facilitada

### **3. Business Intelligence**
- ✅ **Métricas de negócio** em tempo real
- ✅ **Análise de tendências** e padrões
- ✅ **Alertas de KPIs** críticos
- ✅ **Relatórios automatizados**

O sistema de monitoramento garante **visibilidade completa** da aplicação, permitindo **detecção precoce** de problemas, **resposta rápida** a incidentes e **tomada de decisão** baseada em dados, com configurações em formato YAML para fácil manutenção e versionamento.