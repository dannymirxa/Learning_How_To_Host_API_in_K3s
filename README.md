# learning_how_to_host_api_in_kind

## 1. Objectives of this Project:

1. Create a working RESTful API with Bun.
2. Deploy it to Kubernetes using Kind.
3. Makes the instructions beginner firendly as possible.

## 2. Tools used:

### 2.1 Javascript:

1. Bun
2. Express
3. DuckDB
4. Zod

### 2.2 Container:

1. Docker Desktop (Windows)

### 2.3 Kubernetes:

1. Kind

## 2.4 Operating System:

1. Windows Subsystem for Linux (Ubuntu)

## 3. Steps

### 3.1 Javascript

#### 3.1.1 Install Javascript dependencies with below command:

```bash
bun install .
```

#### 3.1.2 Run the Express app with command below:

```bash
bun run server.ts
```

#### 3.1.3 Test the Express APi with any API test client. 

Try to send method such as:

```bash
GET localhost:3000/getAllEmployees
```

### 3.2 Docker 
(I will skip to image creation, I assume you already install DOcker Desktop and enable WSL2 backend)

#### 3.2.1 Create local Docker Image:
Inside this repository I have a Dockerfile. Just run the comand below, this will create a Docker image named employee-api:

```bash
docker build -t employee-api:latest .
```

#### 3.2.2 Check the image with below command:

![image](./images/docker%20image%20list.png)

### 3.3 Kubectl

#### 3.3.1 To Install Kubectl, just follow this instructions, source: <https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/>

Or just run below commands:

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

chmod +x kubectl
mkdir -p ~/.local/bin
mv ./kubectl ~/.local/bin/kubectl
```

### 3.4 Kind

#### 3.4.1 Install GO first, source: <https://go.dev/doc/install>

#### 3.4.2 How to install Kind, source: <https://kind.sigs.k8s.io/docs/user/quick-start/#installing-from-release-binaries>


```bash
curl -Lo ./kind "https://kind.sigs.k8s.io/dl/v0.11.1/kind-$(uname)-amd64"
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

#### 3.4.3 Make sure to setup your PATH environment:

```bash
export PATH=$PATH:/usr/local/go/bin
export PATH=$PATH:/home/user/go/bin
```

#### 3.4.4 Create a cluster.
Create cluster named employee-api with below command:

```bash
kind create cluster employee-api
```

#### 3.4.4 List kind clusters with below command:

![image](./images/kind%20get%20clusters.png)

#### 3.4.4 Load local DOcker image employee-api into kind.
This is needed if you want to use the image inyour local Docker. Use this command:

```bash
kind load docker-image <image name> -n <cluster name>
```

Example:
```bash
kind load docker-image employee-api:latest -n employee-api
```

#### 3.4.5 Create a deployment.
Inside the this repository there is a deployment.yaml. To deploy just run the command below:

```bash
kubectl apply -f deployment.yaml --context kind-employee-api
```

Above commands will deploy the kubernetes deployement for our Express app.

#### 3.4.6 Create a service

Now a service is needed due to the way the pod is exposed or the networking configuration. A Service object need to be created that exposes the pod's port 3000 to the outside world. 

To deploy the service.yaml, run below command:

```bash
kubectl apply -f service.yaml --context kind-employee-api
```

#### 3.4.6 Port forwarding
Forward the port from the pod to your local machine so the API can be accessed. Run below command:

```bash
kubectl port-forward svc/employee-api 3000:3000 &
```

#### P.S Reminder to Myself for such dumb mistake.
In this repository, there is "deployment v1.yaml". Deploying this will fail the pod. The error was "there is no server.ts" file.

It was because of this line:

```bash
volumes:
- name: code-volume
persistentVolumeClaim:
    claimName: employee-api-pvc
```

This file mount a Persistent Volume Claim (PVC) to the `/usr/src/app` directory in the container where the "server.ts" was located.

Mounting PVC will overwrtie any existing files in that direcotry. So PVC mount empty `/mnt/data` to `/usr/src/app`. SO "server.ts" was gone.

If the Docker image already defines a working directory and copies the necessary files into it, then having a Persistent Volume (PV) in the Kubernetes (k8s) deployment is indeed redundant.


## Now the Express app have been deployed to Kubernetes
