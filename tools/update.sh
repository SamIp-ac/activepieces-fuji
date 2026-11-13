# Update Fuji Docker Instances
echo "Updating Fuji..."
git pull
docker build -t fuji:latest .
docker compose up -d --remove-orphans
echo "Successfully updated Fuji."