properties([
    parameters([
        string(defaultValue: 'physiome-submission', description: 'Host to deploy the built Docker image onto.', name: 'DockerImageName'),

        string(defaultValue: '172.31.5.24', description: 'Host to deploy the built Docker image onto.', name: 'DeploymentServer'),
        string(defaultValue: '6001', description: 'Port mapping on the deployment server to deploy from.', name: 'DeploymentPort'),

        string(defaultValue: '/home/ec2-user/config/physiome-submission-dev/env_file', description: 'Host to deploy the built Docker image onto.', name: 'EnvFileLocation'),

        string(defaultValue: '870101719030.dkr.ecr.eu-west-2.amazonaws.com', description: 'ECR Host to publish Docker image onto', name: 'ECRUri'),

        string(defaultValue: 'physiome-submission-camunda', description: 'Camunda Workflow Engine docker container name for linking', name: 'LinkedWorkflowEngine'),
        string(defaultValue: 'physiome-submission-postgres', description: 'Postgres docker container name for linking', name: 'LinkedPostgres'),

        string(defaultValue: 'jenkins-ssh-key', description: 'Deployment server Jenkins SSH credentials name', name: 'DeploymentSSHCredentials'),
    ])
])

node {
    def app
    def GIT_COMMIT
    def BUILD_NAME

    def DOCKER_FILE_NAME = "Dockerfile"
    def DOCKER_IMAGE_NAME = "${params.DockerImageName}"
    def DOCKER_CONTAINER_NAME_PREFIX = DOCKER_IMAGE_NAME

    def DEPLOYMENT_SERVER = "${params.DeploymentServer}"
    def DEPLOYMENT_PORT = "${params.DeploymentPort}"

    def DOCKER_RUN_EXTRA_CURRENT = "--link ${params.LinkedPostgres}:postgres --link ${params.LinkedWorkflowEngine}:workflow"

    def DOCKER_CONTAINER_NAME
    def DOCKER_CONTAINER_ENV

    stage ('Clean') {
        deleteDir()
    }

    stage('Clone repository') {

        def scmVars = checkout scm
        GIT_COMMIT = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()

        DOCKER_CONTAINER_ENV=BRANCH_NAME
        BUILD_NAME=BRANCH_NAME

        if (BUILD_NAME == 'development') {
            DOCKER_FILE_NAME = "./Dockerfile-development"
        }

        DOCKER_CONTAINER_NAME = "${DOCKER_CONTAINER_NAME_PREFIX}.${DOCKER_CONTAINER_ENV}.current"
    }

    stage('Build image') {

        app = docker.build("${DOCKER_IMAGE_NAME}", "-f ${DOCKER_FILE_NAME} .")
    }

    stage('Push image') {
        docker.withRegistry("https://${params.ECRUri}") {
            app.push("${BUILD_NAME}-${env.BUILD_NUMBER}")
            app.push("${GIT_COMMIT}")
            app.push("${DOCKER_CONTAINER_ENV}-latest")
        }
    }

    stage('Deploy') {
        if(DEPLOYMENT_SERVER && DEPLOYMENT_SERVER != "" && DEPLOYMENT_PORT && DEPLOYMENT_PORT != "" && DOCKER_CONTAINER_NAME) {
            withCredentials([sshUserPrivateKey(credentialsId: "${params.DeploymentSSHCredentials}", usernameVariable: 'sshUsername', keyFileVariable: 'sshKeyFile')]) {

                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker pull ${params.ECRUri}/${DOCKER_IMAGE_NAME}:${BUILD_NAME}-${env.BUILD_NUMBER}'"
                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker ps -q --filter name=\'${DOCKER_CONTAINER_NAME}\' | xargs -r docker stop && docker ps -a -q --filter name=\'${DOCKER_CONTAINER_NAME}\' | xargs -r docker rm'"
                sh "ssh -i ${sshKeyFile} ${sshUsername}@${DEPLOYMENT_SERVER} 'docker run -d -p 0.0.0.0:${DEPLOYMENT_PORT}:3000/tcp --restart=always -e ENVIRONMENT=\'${DOCKER_CONTAINER_ENV}\' ${DOCKER_RUN_EXTRA_CURRENT} --env-file=\'${params.EnvFileLocation}\' --name \'${DOCKER_CONTAINER_NAME}\' ${params.ECRUri}/${DOCKER_IMAGE_NAME}:${BUILD_NAME}-${env.BUILD_NUMBER}'"
            }
        }
    }

}
