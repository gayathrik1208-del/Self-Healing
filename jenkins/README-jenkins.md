# Module 4 — Jenkins CI/CD

Automates: push to GitHub → pull latest code → build Docker images → stop the old
containers → start the new ones. The `Jenkinsfile` at the repo root defines the four
stages exactly in that order (plus a fifth "verify" stage that checks the backend's
`/health` endpoint actually comes back up — safe to remove if you want to match the
brief literally).

## 1. Start the Jenkins controller

Jenkins runs as its own container, deliberately kept out of the app's `docker-compose.yml`
so redeploying the app never tears down Jenkins itself.

```bash
cd jenkins

# find the docker group's GID on the Jenkins host, so the jenkins user inside
# the container can actually talk to /var/run/docker.sock
getent group docker | cut -d: -f3
# e.g. 999 — export it (or put it in jenkins/.env) before the next command
export DOCKER_GID=999

docker compose -f docker-compose.jenkins.yml up -d --build
```

Get the initial admin password and unlock at http://localhost:8080:
```bash
docker exec ecommerce-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

The custom image (`jenkins/Dockerfile`) already bundles the plugins the pipeline needs:
Git, GitHub, GitHub Branch Source, Docker Pipeline, Credentials Binding, Pipeline Stage
View — so you can skip the "install suggested plugins" wizard step if you like, or run it
anyway, it's harmless.

## 2. Add the `.env` secret

The pipeline copies a Jenkins-managed `.env` into the workspace before building, so real
secrets (Mongo password, JWT secret, SMTP creds) never live in GitHub.

Jenkins → **Manage Jenkins → Credentials → (global) → Add Credentials**:
- Kind: **Secret file**
- File: your local `.env` (the one with real values, based on the Module 3 `.env.example`
  plus the health-checker's SMTP vars)
- ID: `ecommerce-env-file` (must match `ENV_FILE_CREDENTIAL_ID` in the `Jenkinsfile`)

## 3. Create the pipeline job

**New Item → Pipeline** (or **Multibranch Pipeline** if you want PR/branch builds too):
- **Pipeline → Definition**: "Pipeline script from SCM"
- **SCM**: Git → your GitHub repo URL
- **Script Path**: `Jenkinsfile` (default, since it's at the repo root)

## 4. Wire up the GitHub webhook

On your GitHub repo: **Settings → Webhooks → Add webhook**
- **Payload URL**: `http://<your-jenkins-host>:8080/github-webhook/`
- **Content type**: `application/json`
- **Events**: "Just the push event"

(If Jenkins is on your own machine rather than a public server, GitHub can't reach
`localhost:8080` directly — tunnel it with `ngrok http 8080` for testing, or poll instead:
in the job config, tick **Build Triggers → Poll SCM** with a schedule like `H/5 * * * *`.)

Back in the job config, under **Build Triggers**, tick **"GitHub hook trigger for
GITScm polling"** so the webhook actually fires this job.

## What each stage does

| Stage | Command | Matches brief step |
|---|---|---|
| 1. Pull latest code | `checkout scm` | Pull latest code |
| Load environment file | copies the Jenkins-managed `.env` into the workspace | (secrets, not in the brief but needed for the build) |
| 2. Build Docker image | `docker compose build --pull` | Build Docker image |
| 3. Stop old container | `docker compose down --remove-orphans` | Stop old container |
| 4. Start new container | `docker compose up -d` | Start new container |
| Verify deployment | polls `/api/health` up to 10× / 5s apart | bonus — fails the build loudly if the new containers didn't come up healthy |

## Notes

- `disableConcurrentBuilds()` stops two pushes in quick succession from racing each other
  through `docker compose down` / `up`.
- The `post { always { ... } }` block deletes the injected `.env` from the Jenkins
  workspace after every build, successful or not, so the secret file never lingers on disk.
- If you'd rather Jenkins target a remote server instead of building on its own host, swap
  the `sh` steps for an SSH step (e.g. the SSH Agent plugin) that runs the same
  `docker compose` commands over SSH.
