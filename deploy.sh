#!/bin/bash

# Exit immediately if a command fails
set -e  



echo "🚀 Starting Build and Deployment Process"



echo "🔑 path of ."


echo "🐳 Building Docker Image..."
docker build --platform=linux/amd64 -t $DOCKER_HUB_USERNAME/petrol_bunk_manager:frontend .


echo " Login to docker hub"
echo "$DOCKER_HUB_ACCESS_TOKEN" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin


echo "🚀 Pushing Image to Docker Hub..."
docker push $IMAGE_NAME


# echo "🔑 Setting up SSH Key for EC2..."
# mkdir -p ~/.ssh
# echo "$EC2_SSH_KEY" > ~/.ssh/id_config
# chmod 600 ~/.ssh/id_config

echo "🚀 Connecting to EC2 and Deploying..."
ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST << 'EOF'
    echo "🚀 Stopping and Removing Old Containers..."
    
    docker stop $(docker ps -q) || true
    docker rm $(docker ps -a -q) || true
    docker rmi -f $(docker images -q) || true

    echo "🐳 Pulling Latest Image..."
    docker pull --platform=linux/amd64 navnitan/petrol_bunk_manager:frontend
    echo "🚀 Running New Container..."
    docker run -d --name smart_ledger -p 80:80 -p 443:443 -v ~/ssl:/etc/nginx/ssl navnitan/petrol_bunk_manager:frontend

    echo "✅ Deployment Complete!"
EOF

echo "🎉 Deployment Successful!"