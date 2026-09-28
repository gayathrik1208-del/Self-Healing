// Jenkinsfile — CI/CD for the Self-Healing E-Commerce Platform
// Lives at the repo root, alongside docker-compose.yml.
//
// Pipeline: pull latest code -> build Docker images -> stop old containers
//           -> start new containers -> verify the app came back up healthy.
//
// Trigger: a GitHub webhook (Settings -> Webhooks -> payload URL
// http://<jenkins-host>:8080/github-webhook/, content type application/json)
// fires this job on every push. See README-jenkins.md for one-time setup.

pipeline {
    agent any

    options {
        // Don't let two deploys race each other
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        COMPOSE_PROJECT_NAME = "self-healing-ecommerce"
        // .env holds MONGO_ROOT_PASS, JWT_SECRET, SMTP_* etc. — kept out of Git,
        // injected here from a Jenkins "Secret file" credential (see README).
        ENV_FILE_CREDENTIAL_ID = "ecommerce-env-file"
    }

    stages {

        stage('1. Pull latest code') {
            steps {
                echo "Checking out latest commit from GitHub..."
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Load environment file') {
            steps {
                withCredentials([file(credentialsId: env.ENV_FILE_CREDENTIAL_ID, variable: 'ENV_FILE_PATH')]) {
                    sh 'cp "$ENV_FILE_PATH" .env'
                }
            }
        }

        stage('2. Build Docker image') {
            steps {
                echo "Building images for frontend, backend, and health-checker..."
                sh 'docker compose build --pull'
            }
        }

        stage('3. Stop old container') {
            steps {
                echo "Stopping the currently running stack (if any)..."
                // '|| true' so a first-ever deploy (nothing running yet) doesn't fail the build
                sh 'docker compose down --remove-orphans || true'
            }
        }

        stage('4. Start new container') {
            steps {
                echo "Starting the newly built stack..."
                sh 'docker compose up -d'
            }
        }

        stage('Verify deployment') {
            steps {
                echo "Waiting for the backend health endpoint to respond..."
                script {
                    def attempts = 10
                    def healthy = false
                    for (int i = 0; i < attempts; i++) {
                        def status = sh(
                            script: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || true',
                            returnStdout: true
                        ).trim()
                        if (status == "200") {
                            healthy = true
                            break
                        }
                        echo "Backend not ready yet (attempt ${i + 1}/${attempts}), waiting 5s..."
                        sleep(5)
                    }
                    if (!healthy) {
                        error("Backend did not become healthy after deployment — check 'docker compose logs backend'.")
                    }
                }
                echo "Deployment verified: backend is healthy."
            }
        }
    }

    post {
        success {
            echo "Deployment succeeded: ${env.BUILD_URL}"
        }
        failure {
            echo "Deployment failed: ${env.BUILD_URL} — see stage logs above."
            sh 'docker compose ps || true'
        }
        always {
            // Never leave the injected .env lying around in the workspace
            sh 'rm -f .env'
        }
    }
}
