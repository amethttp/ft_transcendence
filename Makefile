# --- # Colors # --- #
RESET = \033[0m
WHITE_BOLD = \033[1;39m
BLACK_BOLD = \033[1;30m
RED_BOLD = \033[1;31m
GREEN_BOLD = \033[1;32m
YELLOW_BOLD = \033[1;33m
BLUE_BOLD = \033[1;34m
PINK_BOLD = \033[1;35m
CYAN_BOLD = \033[1;36m

WHITE = \033[0;39m
BLACK = \033[0;30m
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
PINK = \033[0;35m
CYAN = \033[0;36m
# ------------------ #


# ---- # Vars # ---- #
RM = rm -rf
MKDIR = mkdir -p
PRINT = echo
DOCKER = docker
CERTBOT = sudo certbot

SRC = src/
BASE_YAML = $(SRC)docker-compose.yml
DEV_YAML = $(SRC)docker-compose.dev.yml
PROD_YAML = $(SRC)docker-compose.prod.yml
COMPOSE_DEV = $(DOCKER) compose -f $(BASE_YAML) -f $(DEV_YAML)
COMPOSE_PROD = $(DOCKER) compose -f $(BASE_YAML) -f $(PROD_YAML)

CERT_NAME ?= amethpong.fun
CERT_DOMAINS ?= -d amethpong.fun -d www.amethpong.fun -d api.amethpong.fun -d game.amethpong.fun
CERT_EMAIL ?= info@amethpong.fun
CERTBOT_WEBROOT ?= /var/www/letsencrypt

VOLUMES_DIR=volumes/
DATABASE_VOLUME=$(VOLUMES_DIR)database/
UPLOADS_VOLUME=$(VOLUMES_DIR)uploads/
WEB_VOLUME=$(VOLUMES_DIR)web/
# ------------------ #


# --- # Rules # ---- #
all:
	@$(PRINT) "$(CYAN)Use $(YELLOW)'make prod'$(CYAN) to build the application (or $(YELLOW)'make up'$(CYAN) to build it as development) $(RESET)"

list:
	@$(PRINT) "$(CYAN)Printing all $(YELLOW)containers$(CYAN):$(RESET)"
	@$(DOCKER) ps -a
	@$(PRINT) "$(CYAN)Printing all $(YELLOW)images$(CYAN):$(RESET)"
	@$(DOCKER) images -a
	@$(PRINT) "$(CYAN)Printing all $(YELLOW)volumes$(CYAN):$(RESET)"
	@$(DOCKER) volume ls
	@$(PRINT) "$(CYAN)Printing all $(YELLOW)networks$(CYAN):$(RESET)"
	@$(DOCKER) network ls

up:
	@$(PRINT) "$(BLUE)Creating $(WHITE_BOLD)volumes$(BLUE) directories...$(RESET)"
	@$(MKDIR) $(DATABASE_VOLUME) $(UPLOADS_VOLUME) $(WEB_VOLUME)
	@$(PRINT) "$(BLUE)Deploying $(WHITE_BOLD)application$(BLUE)...$(RESET)"
	@$(COMPOSE_DEV) up -d --build

prod:
	@$(PRINT) "$(BLUE)Creating $(WHITE_BOLD)volumes$(BLUE) directories...$(RESET)"
	@$(MKDIR) $(DATABASE_VOLUME) $(UPLOADS_VOLUME) $(WEB_VOLUME)
	@$(PRINT) "$(BLUE)Deploying $(WHITE_BOLD)application$(BLUE)...$(RESET)"
	@$(COMPOSE_PROD) up -d --build

pull:
	@$(PRINT) "$(BLUE)Updating repository with $(WHITE_BOLD)git pull --ff-only$(BLUE)...$(RESET)"
	@git pull --ff-only

rebuild:
	@$(PRINT) "$(BLUE)Creating $(WHITE_BOLD)volumes$(BLUE) directories...$(RESET)"
	@$(MKDIR) $(DATABASE_VOLUME) $(UPLOADS_VOLUME) $(WEB_VOLUME)
	@$(PRINT) "$(BLUE)Rebuilding $(WHITE_BOLD)development$(BLUE) stack without removing volumes...$(RESET)"
	@$(COMPOSE_DEV) up -d --build --force-recreate --remove-orphans

rebuild-prod:
	@$(PRINT) "$(BLUE)Creating $(WHITE_BOLD)volumes$(BLUE) directories...$(RESET)"
	@$(MKDIR) $(DATABASE_VOLUME) $(UPLOADS_VOLUME) $(WEB_VOLUME)
	@$(PRINT) "$(BLUE)Rebuilding $(WHITE_BOLD)production$(BLUE) stack without removing volumes...$(RESET)"
	@$(COMPOSE_PROD) up -d --build --force-recreate --remove-orphans

update:
	@$(MAKE) pull
	@$(MAKE) rebuild

update-prod:
	@$(MAKE) pull
	@$(MAKE) rebuild-prod

cert-init-standalone:
	@$(PRINT) "$(BLUE)Requesting $(WHITE_BOLD)Let's Encrypt$(BLUE) certificate via standalone for $(WHITE_BOLD)$(CERT_NAME)$(BLUE)...$(RESET)"
	@$(PRINT) "$(YELLOW)NOTE: no container must be listening on port 80 right now.$(RESET)"
	@$(CERTBOT) certonly --standalone --cert-name $(CERT_NAME) $(CERT_DOMAINS) --agree-tos -m $(CERT_EMAIL) --non-interactive

cert-init:
	@$(PRINT) "$(BLUE)Requesting $(WHITE_BOLD)Let's Encrypt$(BLUE) certificate via webroot for $(WHITE_BOLD)$(CERT_NAME)$(BLUE)...$(RESET)"
	@$(PRINT) "$(YELLOW)NOTE: nginx container must be running (make prod) before using this target.$(RESET)"
	@sudo mkdir -p $(CERTBOT_WEBROOT)
	@$(CERTBOT) certonly --webroot -w $(CERTBOT_WEBROOT) --cert-name $(CERT_NAME) $(CERT_DOMAINS) --agree-tos -m $(CERT_EMAIL) --non-interactive

cert-renew:
	@$(PRINT) "$(BLUE)Renewing $(WHITE_BOLD)Let's Encrypt$(BLUE) certificates and reloading $(WHITE_BOLD)nginx$(BLUE)...$(RESET)"
	@$(CERTBOT) renew --deploy-hook 'cd "$(CURDIR)" && $(COMPOSE_PROD) exec -T nginx nginx -s reload'

cert-renew-dry-run:
	@$(PRINT) "$(BLUE)Running $(WHITE_BOLD)Let's Encrypt$(BLUE) dry-run renewal and nginx reload hook...$(RESET)"
	@$(CERTBOT) renew --dry-run --deploy-hook 'cd "$(CURDIR)" && $(COMPOSE_PROD) exec -T nginx nginx -s reload'

down:
	@$(PRINT) "$(BLUE)Stopping and removing application $(WHITE_BOLD)containers$(BLUE)...$(RESET)"
	@$(DOCKER) compose -f $(BASE_YAML) down

fdown:
	@$(PRINT) "$(BLUE)Stopping and removing application $(WHITE_BOLD)containers$(BLUE) and $(WHITE_BOLD)volumes$(BLUE)...$(RESET)"
	@$(DOCKER) compose -f $(BASE_YAML) -f $(DEV_YAML) down -v
	@$(RM) $(DATABASE_VOLUME) $(UPLOADS_VOLUME) $(WEB_VOLUME)

log:
	@while [ -z "$$TARGET" ]; do \
		$(PRINT) -n "$(PINK)Type the container to read the logs of $(WHITE_BOLD)(front/game/nginx/platform)$(PINK): $(RESET)"; \
		read -r -p "" TARGET; \
	done; \
	$(PRINT) "$(PINK)Reading $(WHITE_BOLD)$$TARGET$(PINK) logs...$(RESET)"; \
	$(DOCKER) logs -f $$(docker ps -aq --filter="name=($$TARGET)")

interact:
	@while [ -z "$$TARGET" ]; do \
		$(PRINT) -n "$(PINK)Type the container to interact with $(WHITE_BOLD)(front/game/nginx/platform)$(PINK): $(RESET)"; \
		read -r -p "" TARGET; \
	done; \
	$(PRINT) "$(PINK)Interacting with $(WHITE_BOLD)$$TARGET$(PINK) container with a $(WHITE_BOLD)bash$(PINK) shell...$(RESET)"; \
	$(DOCKER) exec -it $$(docker ps -aq --filter="name=($$TARGET)") /bin/sh;

clean: down
	@$(PRINT) "$(PINK)Application $(GREEN)removed$(PINK).$(RESET)"
	@$(DOCKER) system prune -fa
	@$(PRINT) "$(GREEN)Cache removed successfully$(RESET)"

fclean: fdown
	@$(PRINT) "$(PINK)Removing $(WHITE_BOLD)cache$(PINK)...$(RESET)"
	@$(DOCKER) system prune -fa
	@$(PRINT) "$(GREEN)Cache removed successfully$(RESET)"

re: fclean up
	@$(PRINT) "$(GREEN)Application rebuilt successfully$(RESET)"

# ------------------ #


# --- # Extras # --- #
.PHONY: all \
		list \
		up \
		prod \
		pull \
		rebuild \
		rebuild-prod \
		update \
		update-prod \
		cert-init-standalone \
		cert-init \
		cert-renew \
		cert-renew-dry-run \
		down \
		fdown \
		log \
		interact \
		clean \
		fclean \
		re

.SILENT:
# ------------------ #
