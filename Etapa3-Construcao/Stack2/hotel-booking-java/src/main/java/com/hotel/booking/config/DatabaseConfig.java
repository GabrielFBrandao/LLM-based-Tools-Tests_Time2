package com.hotel.booking.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;
import java.util.UUID;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class DatabaseConfig {

    /**
     * Provider para auditoria JPA
     */
    @Bean
    public AuditorAware<UUID> auditorProvider() {
        return () -> Optional.of(UUID.randomUUID()); // Em um sistema real, seria o ID do usuário autenticado
    }

    /**
     * Configurações de conexão com banco de dados
     */
    @Configuration
    @ConfigurationProperties(prefix = "spring.datasource")
    public static class DataSourceProperties {
        private String url;
        private String username;
        private String password;
        private String driverClassName;

        // Getters e Setters
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getDriverClassName() { return driverClassName; }
        public void setDriverClassName(String driverClassName) { this.driverClassName = driverClassName; }
    }

    /**
     * Configurações do JPA
     */
    @Configuration
    @ConfigurationProperties(prefix = "spring.jpa")
    public static class JpaProperties {
        private String hibernateDdlAuto = "update";
        private boolean showSql = false;
        private String dialect = "org.hibernate.dialect.PostgreSQLDialect";

        // Getters e Setters
        public String getHibernateDdlAuto() { return hibernateDdlAuto; }
        public void setHibernateDdlAuto(String hibernateDdlAuto) { this.hibernateDdlAuto = hibernateDdlAuto; }

        public boolean isShowSql() { return showSql; }
        public void setShowSql(boolean showSql) { this.showSql = showSql; }

        public String getDialect() { return dialect; }
        public void setDialect(String dialect) { this.dialect = dialect; }
    }
}
