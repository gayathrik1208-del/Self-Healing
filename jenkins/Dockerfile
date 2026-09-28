# ---- Custom Jenkins controller image with Docker CLI + Compose ----
# The stock jenkins/jenkins image has no docker client, so pipeline
# stages calling `docker compose ...` would fail without this.

FROM jenkins/jenkins:lts-jdk17

USER root

# Install Docker CLI + the Compose v2 plugin (gives us `docker compose`, not `docker-compose`)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates curl gnupg && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
        > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends docker-ce-cli docker-compose-plugin && \
    rm -rf /var/lib/apt/lists/*

# Let the jenkins user run docker commands against the socket mounted from the host
RUN groupadd -f docker && usermod -aG docker jenkins

USER jenkins

# Recommended plugins for this pipeline: Git, GitHub, Docker Pipeline, Credentials Binding
RUN jenkins-plugin-cli --plugins \
    git \
    github \
    github-branch-source \
    docker-workflow \
    credentials-binding \
    pipeline-stage-view \
    workflow-aggregator
