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

SRC = src/
BASE_YAML = $(SRC)docker-compose.yml
DEV_YAML = $(SRC)docker-compose.dev.yml
PROD_YAML = $(SRC)docker-compose.prod.yml

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
	@$(DOCKER) compose -f $(BASE_YAML) -f $(DEV_YAML) up -d --build

prod:
	@$(PRINT) "$(BLUE)Creating $(WHITE_BOLD)volumes$(BLUE) directories...$(RESET)"
	@$(MKDIR) $(DATABASE_VOLUME) $(UPLOADS_VOLUME) $(WEB_VOLUME)
	@$(PRINT) "$(BLUE)Deploying $(WHITE_BOLD)application$(BLUE)...$(RESET)"
	@$(DOCKER) compose -f $(BASE_YAML) -f $(PROD_YAML) up -d --build

down:
	@$(PRINT) "$(BLUE)Stopping and removing application $(WHITE_BOLD)containers$(BLUE)...$(RESET)"
	@$(DOCKER) compose -f $(BASE_YAML) down

fdown:
	@$(PRINT) "$(BLUE)Stopping and removing application $(WHITE_BOLD)containers$(BLUE) and $(WHITE_BOLD)volumes$(BLUE)...$(RESET)"
	@$(DOCKER) compose -f $(BASE_YAML) down -v
	@$(RM) $(DATABASE_VOLUME) $(UPLOADS_VOLUME) $(WEB_VOLUME)

log:
	@while [ -z "$$TARGET" ]; do \
		$(PRINT) -n "$(PINK)Type the container to read the logs of $(WHITE_BOLD)(front/game/nginx/platform)$(PINK): $(RESET)"; \
		read -r -p "" TARGET; \
	done; \
	$(PRINT) "$(PINK)Reading $(WHITE_BOLD)$$TARGET$(PINK) logs...$(RESET)"; \
	$(DOCKER) logs $$(docker ps -aq --filter="name=($$TARGET)")

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

# ------------------ #


# --- # Extras # --- #
.PHONY: all \
		list \
		up \
		prod \
		down \
		fdown \
		log \
		interact \
		clean \
		fclean

.SILENT:
# ------------------ #
