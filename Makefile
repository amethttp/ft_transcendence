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
COPY = cp -rf
RM = rm -rf
MKDIR = mkdir -p
PRINT = echo
DOCKER = docker

SRC = src/
ENV_FILE = $(SRC).env
YAML = $(SRC)docker-compose.yml

TEST=test
TEST_DIR=$(SRC)test_container/
VOLUME_DIR=volumes/
DATABASE_VOLUME=$(VOLUME_DIR)database/
WEB_VOLUME=$(VOLUME_DIR)web/
# ------------------ #


# --- # Rules # ---- #
all:
	@$(PRINT) "$(CYAN)Use $(YELLOW)'make up'$(CYAN) to build the application$(RESET)"

copy:
	@$(PRINT) "$(PINK)Copying files to $(WHITE_BOLD)VM$(PINK)...$(RESET)"
	@$(COPY) * $(ENV_FILE) $(SHARED_DIR)
	@$(PRINT) "$(GREEN)Files copied$(RESET)"

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
	@$(MKDIR) $(DATABASE_VOLUME) $(WEB)
	@$(PRINT) "$(BLUE)Deploying $(WHITE_BOLD)application$(BLUE)...$(RESET)"
	@$(DOCKER) compose -f $(YAML) up -d --build

down:
	@$(PRINT) "$(BLUE)Stopping and removing application $(WHITE_BOLD)containers$(BLUE)...$(RESET)"
	@$(DOCKER) compose -f $(YAML) down

fdown:
	@$(PRINT) "$(BLUE)Stopping and removing application $(WHITE_BOLD)containers$(BLUE) and $(WHITE_BOLD)volumes$(BLUE)...$(RESET)"
	@$(DOCKER) compose -f $(YAML) down -v

log:
	@$(PRINT) "$(PINK)Reading $(WHITE_BOLD)$(TEST)$(PINK) logs...$(RESET)"
	@$(DOCKER) logs $(TEST)

bld:
	@$(PRINT) "$(PINK)Building $(WHITE_BOLD)$(TEST)$(PINK) image...$(RESET)"
	@$(DOCKER) build -t $(TEST) $(TEST_DIR)

run:
	@$(PRINT) "$(PINK)Running $(WHITE_BOLD)$(TEST)$(PINK) container...$(RESET)"
	@$(DOCKER) run -d --name $(TEST) $(TEST)

dpl: bld run
	@$(PRINT) "$(GREEN)The $(WHITE_BOLD)$(TEST)$(GREEN) container deployed successfully$(RESET)"

interact:
	@while [ -z "$$TARGET" ]; do \
		$(PRINT) -n "$(PINK)Type the container to interact with $(WHITE_BOLD)(sqlite/test)$(PINK): $(RESET)"; \
		read -r -p "" TARGET; \
	done; \
	$(PRINT) "$(PINK)Interacting with $(WHITE_BOLD)$$TARGET$(PINK) container with a $(WHITE_BOLD)bash$(PINK) shell...$(RESET)"; \
	$(DOCKER) exec -it $$(docker ps -aq --filter="name=($$TARGET)") /bin/sh;

stp:
	@$(PRINT) "$(PINK)Stopping $(WHITE_BOLD)$(TEST)$(PINK) container...$(RESET)"
	@$(DOCKER) stop $$(docker ps -aq --filter="name=$(TEST)")

cln: stp
	@$(PRINT) "$(PINK)Removing $(WHITE_BOLD)$(TEST)$(PINK) container...$(RESET)"
	@$(DOCKER) rm $$(docker ps -aq --filter="name=$(TEST)")

clean: down
	@$(PRINT) "$(PINK)Application $(GREEN)removed$(PINK).$(RESET)"

fclean: fdown
	@$(PRINT) "$(PINK)Removing $(WHITE_BOLD)cache$(PINK)...$(RESET)"
	@$(DOCKER) system prune -fa
	@$(PRINT) "$(GREEN)Cache removed successfully$(RESET)"

# ------------------ #


# --- # Extras # --- #
.PHONY: all \
		copy \
		list \
		up \
		down \
		fdown \
		bld \
		run \
		dpl \
		exc \
		stp \
		cln \
		clean \
		fclean

.SILENT:
# ------------------ #
