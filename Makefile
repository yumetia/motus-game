.PHONY: up restart down clean

up:
	docker compose up --build

restart:
	docker compose down -v --remove-orphans
	docker compose up --build

down:
	docker compose down -v

clean:
	docker compose down -v --remove-orphans
