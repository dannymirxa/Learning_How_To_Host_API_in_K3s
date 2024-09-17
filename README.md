# learning_how_to_host_api_in_kind

## 1. Objectives of this Project

1. Create a working RESTful API with Bun.
2. Deploy it to Kubernetes using Kind.
3. Makes the instructions beginner firendly as possible.

## 2. Tools used

### 2.1 Javascript

1. Bun
2. Express
3. DuckDB
4. Zod

### 2.2 Container

1. Docker Desktop (Windows)

### 2.3 Kubernetes

1. Kind

## 2.4 Operating System

1. Windows Subsystem for Linux (Ubuntu)

## 3. Steps

### 3.1 Javascript

#### 3.1.1 Install Javascript dependencies with below command

```bash
bun install .
```

#### 3.1.2 Run the Express app with command below

```bash
bun run server.ts
```

#### 3.1.3 Test the Express APi with any API test client

Try to send method such as:

```bash
GET localhost:3000/getAllEmployees
```

### 3.2 Docker

(I will skip to image creation, I assume you already install DOcker Desktop and enable WSL2 backend)

#### 3.2.1 Create local Docker Image

Inside this repository I have a Dockerfile. Just run the comand below, this will create a Docker image named employee-api:

```bash
docker build -t employee-api:latest .
```

#### 3.2.2 Check the image with below command

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

#### 3.4.3 Make sure to setup your PATH environment

```bash
export PATH=$PATH:/usr/local/go/bin
export PATH=$PATH:/home/user/go/bin
```

#### 3.4.4 Create a cluster

Create cluster named employee-api with below steps:

#### 3.4.4.1 Create a yaml file name kind-config.yaml

```bash
nano kind-config.yaml
```

#### 3.4.4.2 Put below config. I decided to have 1 control plane and 1 worker

I attemped to mount a local directory to the container based on this guide: <https://kind.sigs.k8s.io/docs/user/configuration/#extra-mounts>. But this feature does not exist for Docker Free version: <https://docs.docker.com/desktop/synchronized-file-sharing/>.

```bash
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
  extraMounts:
  - hostPath: /home/Learning_How_To_Host_API_in_Kind
    containerPath: /employee-api-app
```

```bash
kind create cluster --name=employee-api --config=kind-config.yaml
```

#### 3.4.4 List kind clusters with below command

![image](./images/kind%20get%20clusters.png)

#### 3.4.5 Upload file from local to the node

List the Container ID

```bash
docker ps
```

![image](./images/docker%20ps.png)

Run the command below to copy the Employee.db to the node

```bash
docker cp <file in local machine> <container ID>:<directory in the container>
```

```bash
docker cp Employee.db 61e3c719111b:/employee-api-app
```

#### 3.4.6 Load local Docker image employee-api into kind

This is needed if you want to use the image inyour local Docker. Use this command:

```bash
kind load docker-image <image name> -n <cluster name>
```

Example:

```bash
kind load docker-image employee-api:latest -n employee-api
```

#### 3.4.7 Create a Persistent Volume

Inside the this repository there is a persistentVolume.yaml. To deploy just run the command below:

```bash
kubectl apply -f persistentVolume.yaml --context kind-employee-api
```

#### 3.4.8 Create a Persistent Volume Claim

Inside the this repository there is a persistentVolumeClaim.yaml. To deploy just run the command below:

```bash
kubectl apply -f persistentVolumeClaim.yaml --context kind-employee-api
```

#### 3.4.9 Create a deployment

Inside the this repository there is a deployment.yaml. To deploy just run the command below:

```bash
kubectl apply -f deployment.yaml --context kind-employee-api
```

Above commands will deploy the kubernetes deployement for our Express app.

#### 3.4.10 Create a service

Now a service is needed due to the way the pod is exposed or the networking configuration. A Service object need to be created that exposes the pod's port 3000 to the outside world.

To deploy the service.yaml, run below command:

```bash
kubectl apply -f service.yaml --context kind-employee-api
```

#### 3.4.11 Port forwarding

Forward the port from the pod to your local machine so the API can be accessed. Run below command:

```bash
kubectl port-forward svc/employee-api 3000:3000
```

#### 3.4.12 Debug a running pod

A pod can be debugged using command below:

```bash
kubectl debug <pod name> -it --image=<image name> --target=<container name>
```

```bash
kubectl debug employee-api-deployment-6c7f8fcc95-ttb88 -it --image=debian --target=employee-api
```

kubectl exec -it employee-api-deployment-6c7f8fcc95-4lxzf -- bash

helm install employeeapi employee-api/

#### P.S Reminder to Myself

##### 1. Check if the local file is uploaded into the node

![image](./images/docker%20exec%20container.png)

Image above shows Employee.db uploaded to /employee-api-app in the node.

###### 2. Set the local path in the NODE properly. Since I want to use Employee.db in /employee-api-app. Set the path to /employee-api-app. By default Kind will deploy to worker node if it exists, so I set node affinity to the worker node

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: employee-api-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  local:
    # path in NODE
    path: /employee-api-app
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - employee-api-worker
```

##### 3. Properly mount Persistent Volume Claim in the deployment

From how I understand it, say the mount volume are as below:

1. container: /usr/src/app/database
2. persistent volume: /employee-api-app

These 2 directory will sync with each other.

We can see by comparing the directories in the node and the pod, I created testing.txt in the node to see is it will appear in the pod:

Pod:

![image](./images/kubectl%20exec%20ls.png)

Node:

![image](./images/docker%20exec%20ls.png)

I included initContainer to run the command below:

```bash
chmod 777 /usr/src/app/database/Employee.db
```

This to to give permission to any app to use the local db.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: employee-api-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: employee-api
  template:
    metadata:
      labels:
        app: employee-api
    spec:
      initContainers:
        - name: init-chmod
          image: busybox
          command: ["sh", "-c", "chmod 777 /usr/src/app/database/Employee.db"]
          volumeMounts:
            - name: employee-db
              mountPath: /usr/src/app/database
      containers:
        - name: employee-api
          image: employee-api:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 3000
          volumeMounts:
            - name: employee-db
              # Container directory
              # /usr/src/app contains ts code
              # /usr/src/app/database contains Employee.db (from Persistent Volume)
              mountPath: /usr/src/app/database
      volumes:
        - name: employee-db
          persistentVolumeClaim:
            # Persistent Volume /employee-api-app 
            # contains Employee.db
            claimName: employee-api-pvc
```

## Now the Express app have been deployed to Kubernetes
