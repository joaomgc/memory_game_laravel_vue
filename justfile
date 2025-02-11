
GROUP := "dad-group-27"
VERSION := "1.0.0"


kubectl-pods:
    kubectl get pods

replace-group-kubernetes-resources:


laravel-build group=GROUP version=VERSION:
    docker build -t registry.172.22.21.107.sslip.io/{{group}}/api:v{{version}} \
    -f ./deployment/DockerfileLaravel ./laravel \
    --build-arg GROUP={{group}} --debug
laravel-push:
    docker push registry.172.22.21.107.sslip.io/{{group}}/api:v{{version}}

vue-build:
    docker build -t registry.172.22.21.107.sslip.io/{{group}}/web:v{{version}} -f ./deployment/DockerfileVue ./vue
vue-push:
    docker push registry.172.22.21.107.sslip.io/{{group}}/web:v{{version}}

ws-build:
    docker build -t registry.172.22.21.107.sslip.io/{{group}}/ws:v{{version}} -f ./deployment/DockerfileWS ./websockets

ws-push:
    docker push registry.172.22.21.107.sslip.io/{{group}}/ws:v{{version}}