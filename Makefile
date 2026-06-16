.PHONY: up down test logs reset

up:
	docker compose up --build

down:
	docker compose down

test:
	cd recommender && python -m pytest
	cd backend && npm test
	cd frontend && npm run build

logs:
	docker compose logs -f

reset:
	docker compose down -v
	docker compose up --build
