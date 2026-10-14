-- ==========================================================
--  BubaTag — Banco de Dados
--  Sistema de monitoramento de búfalos
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `bubatag`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `bubatag`;

-- ----------------------------------------------------------
-- Tabela: usuarios
-- Produtores rurais que gerenciam os animais
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
    `idusuario`  INT          NOT NULL AUTO_INCREMENT,
    `nome`       VARCHAR(255) DEFAULT NULL,
    `email`      VARCHAR(255) DEFAULT NULL,
    `senha`      VARCHAR(255) DEFAULT NULL,
    `CCIR`       VARCHAR(13)  DEFAULT NULL,
    `ativo`      BOOLEAN      NOT NULL DEFAULT 1,
    PRIMARY KEY (`idusuario`),
    UNIQUE KEY `uq_email` (`email`),
    UNIQUE KEY `uq_CCIR`  (`CCIR`)
) ENGINE=InnoDB
  AUTO_INCREMENT=1
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------
-- Tabela: coleiras
-- Dispositivos IoT acoplados aos animais
-- coleira_localizacao removida (substituída pela tabela localizacao)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coleiras` (
    `idcoleira`  INT         NOT NULL AUTO_INCREMENT,
    `n_coleira`  VARCHAR(4)  DEFAULT NULL,
    `IP`         VARCHAR(15) DEFAULT NULL,
    `ativo`      BOOLEAN     NOT NULL DEFAULT 1,
    `idusuario`  INT         DEFAULT NULL,
    PRIMARY KEY (`idcoleira`),
    KEY `fk_coleiras_usuario` (`idusuario`),
    CONSTRAINT `coleiras_ibfk_1`
        FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`idusuario`)
) ENGINE=InnoDB
  AUTO_INCREMENT=1
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------
-- Tabela: bubalinos
-- Cadastro dos animais
-- sexo alterado para ENUM
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bubalinos` (
    `idbubalino`  INT                    NOT NULL AUTO_INCREMENT,
    `nome`        VARCHAR(255)           DEFAULT NULL,
    `raca`        VARCHAR(255)           DEFAULT NULL,
    `n_etiqueta`  VARCHAR(5)             DEFAULT NULL,
    `dt_nasc`     DATE                   DEFAULT NULL,
    `sexo`        ENUM('Macho','Fêmea')  DEFAULT NULL,
    `ativo`       BOOLEAN                NOT NULL DEFAULT 1,
    `idcoleira`   INT                    DEFAULT NULL,
    `idusuario`   INT                    DEFAULT NULL,
    PRIMARY KEY (`idbubalino`),
    KEY `fk_bubalinos_coleira`  (`idcoleira`),
    KEY `fk_bubalinos_usuario`  (`idusuario`),
    CONSTRAINT `bubalinos_ibfk_1`
        FOREIGN KEY (`idcoleira`) REFERENCES `coleiras`  (`idcoleira`),
    CONSTRAINT `bubalinos_ibfk_2`
        FOREIGN KEY (`idusuario`) REFERENCES `usuarios` (`idusuario`)
) ENGINE=InnoDB
  AUTO_INCREMENT=1
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------
-- Tabela: dados
-- Leituras dos sensores (batimento + temperatura)
-- dt_leitura adicionado para análise de séries temporais
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dados` (
    `iddados`             INT          NOT NULL AUTO_INCREMENT,
    `batimento_cardiaco`  INT          DEFAULT NULL,
    `temperatura`         DECIMAL(5,2) DEFAULT NULL,
    `dt_leitura`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ativo`               BOOLEAN      NOT NULL DEFAULT 1,
    `idbubalino`          INT          DEFAULT NULL,
    `idcoleira`           INT          DEFAULT NULL,
    PRIMARY KEY (`iddados`),
    KEY `fk_dados_bubalino` (`idbubalino`),
    KEY `fk_dados_coleira`  (`idcoleira`),
    KEY `idx_dados_leitura`  (`dt_leitura`),
    CONSTRAINT `dados_ibfk_1`
        FOREIGN KEY (`idcoleira`)  REFERENCES `coleiras`  (`idcoleira`),
    CONSTRAINT `dados_ibfk_2`
        FOREIGN KEY (`idbubalino`) REFERENCES `bubalinos` (`idbubalino`)
) ENGINE=InnoDB
  AUTO_INCREMENT=1
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------
-- Tabela: localizacao
-- Posição GPS do animal em tempo real
-- latitude e longitude alterados para DECIMAL(10,7)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `localizacao` (
    `idlocalizacao`  INT            NOT NULL AUTO_INCREMENT,
    `latitude`       DECIMAL(10,7)  NOT NULL DEFAULT 0.0000000,
    `longitude`      DECIMAL(10,7)  NOT NULL DEFAULT 0.0000000,
    `dt_registro`    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ativo`          BOOLEAN        NOT NULL DEFAULT 1,
    `idbubalino`     INT            DEFAULT NULL,
    `idcoleira`      INT            DEFAULT NULL,
    PRIMARY KEY (`idlocalizacao`),
    KEY `fk_localizacao_bubalino` (`idbubalino`),
    KEY `fk_localizacao_coleira`  (`idcoleira`),
    CONSTRAINT `fk_localizacao_bubalinos`
        FOREIGN KEY (`idbubalino`) REFERENCES `bubalinos` (`idbubalino`)
        ON DELETE SET NULL ON UPDATE SET NULL,
    CONSTRAINT `fk_localizacao_coleira`
        FOREIGN KEY (`idcoleira`)  REFERENCES `coleiras`  (`idcoleira`)
        ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE=InnoDB
  AUTO_INCREMENT=1
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------
-- Tabela: historico_estresse
-- Episódios de estresse detectados pelo job de análise
-- dt_fim adicionado para registrar duração do episódio
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `historico_estresse` (
    `idhistorico_estresse`  INT          NOT NULL AUTO_INCREMENT,
    `estado_estresse`       ENUM(
                              'Normal',
                              'Leve',
                              'Moderado',
                              'Alto'
                            )            DEFAULT 'Normal',
    `dt_inicio`             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `dt_fim`                DATETIME     DEFAULT NULL,
    `ativo`                 BOOLEAN      NOT NULL DEFAULT 1,
    `idbubalino`            INT          NOT NULL,
    PRIMARY KEY (`idhistorico_estresse`),
    KEY `fk_estresse_bubalino` (`idbubalino`),
    KEY `idx_estresse_inicio`  (`dt_inicio`),
    CONSTRAINT `historico_estresse_ibfk_1`
        FOREIGN KEY (`idbubalino`) REFERENCES `bubalinos` (`idbubalino`)
) ENGINE=InnoDB
  AUTO_INCREMENT=1
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci;


-- ==========================================================
--  JOB: Análise de estresse (executar a cada 5 minutos)
--  Lógica:
--    1. Calcula média de batimento e temperatura dos últimos
--       5 minutos por animal
--    2. Classifica o estado de estresse
--    3. Se episódio ativo existe e estado mudou → fecha com dt_fim
--    4. Se novo episódio (ou mudança de estado) → insere registro
-- ==========================================================

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS `sp_analisar_estresse`()
BEGIN
    -- Variáveis de iteração
    DECLARE v_idbubalino        INT;
    DECLARE v_media_bpm         DECIMAL(8,2);
    DECLARE v_media_temp        DECIMAL(8,2);
    DECLARE v_novo_estado       ENUM('Normal','Leve','Moderado','Alto');
    DECLARE v_estado_atual      ENUM('Normal','Leve','Moderado','Alto');
    DECLARE v_idhistorico       INT;
    DECLARE v_fim_cursor        BOOLEAN DEFAULT FALSE;

    -- Cursor: todos os animais ativos com leituras nos últimos 5 minutos
    DECLARE cur_animais CURSOR FOR
        SELECT
            d.idbubalino,
            AVG(d.batimento_cardiaco) AS media_bpm,
            AVG(d.temperatura)        AS media_temp
        FROM `dados` d
        INNER JOIN `bubalinos` b ON b.idbubalino = d.idbubalino
        WHERE
            d.dt_leitura >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            AND d.ativo   = 1
            AND b.ativo   = 1
        GROUP BY d.idbubalino;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fim_cursor = TRUE;

    OPEN cur_animais;

    loop_animais: LOOP
        FETCH cur_animais INTO v_idbubalino, v_media_bpm, v_media_temp;
        IF v_fim_cursor THEN
            LEAVE loop_animais;
        END IF;

        -- -------------------------------------------------------
        -- Classificação de estresse
        -- Ajuste os limiares conforme literatura/veterinário
        --   Búfalos: BPM normal ~40-60 | Temp normal ~38.0-39.5°C
        -- -------------------------------------------------------
        SET v_novo_estado =
            CASE
                WHEN v_media_bpm > 90  OR v_media_temp > 40.5 THEN 'Alto'
                WHEN v_media_bpm > 75  OR v_media_temp > 39.8 THEN 'Moderado'
                WHEN v_media_bpm > 65  OR v_media_temp > 39.3 THEN 'Leve'
                ELSE 'Normal'
            END;

        -- -------------------------------------------------------
        -- Busca episódio ativo (dt_fim IS NULL) para este animal
        -- -------------------------------------------------------
        SELECT
            idhistorico_estresse,
            estado_estresse
        INTO
            v_idhistorico,
            v_estado_atual
        FROM `historico_estresse`
        WHERE
            idbubalino = v_idbubalino
            AND dt_fim IS NULL
            AND ativo  = 1
        ORDER BY dt_inicio DESC
        LIMIT 1;

        IF v_idhistorico IS NOT NULL THEN
            -- Episódio em aberto existe
            IF v_estado_atual <> v_novo_estado THEN
                -- Estado mudou: fecha o episódio atual
                UPDATE `historico_estresse`
                SET `dt_fim` = NOW()
                WHERE `idhistorico_estresse` = v_idhistorico;

                -- Abre novo episódio somente se saiu do Normal
                IF v_novo_estado <> 'Normal' THEN
                    INSERT INTO `historico_estresse`
                        (`estado_estresse`, `dt_inicio`, `idbubalino`)
                    VALUES
                        (v_novo_estado, NOW(), v_idbubalino);
                END IF;
            END IF;
            -- Se estado igual, não faz nada (episódio continua em aberto)
        ELSE
            -- Nenhum episódio ativo: abre um se não for Normal
            IF v_novo_estado <> 'Normal' THEN
                INSERT INTO `historico_estresse`
                    (`estado_estresse`, `dt_inicio`, `idbubalino`)
                VALUES
                    (v_novo_estado, NOW(), v_idbubalino);
            END IF;
        END IF;

        -- Reseta variável para próxima iteração
        SET v_idhistorico = NULL;
        SET v_estado_atual = NULL;

    END LOOP loop_animais;

    CLOSE cur_animais;
END$$

DELIMITER ;

-- ----------------------------------------------------------
-- Agendamento do job (MySQL Event Scheduler)
-- Requer: SET GLOBAL event_scheduler = ON;
-- ----------------------------------------------------------
CREATE EVENT IF NOT EXISTS `evt_analisar_estresse`
    ON SCHEDULE EVERY 5 MINUTE
    STARTS NOW()
    ON COMPLETION PRESERVE
    ENABLE
    COMMENT 'Analisa leituras dos sensores e registra episódios de estresse'
    DO
        CALL sp_analisar_estresse();
