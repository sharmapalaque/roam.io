pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run npm Unit Tests') {
            steps {
                dir('web/roam') {
                    bat 'npm ci'
                    bat 'npm test'
                }
            }
        }
        
        stage('Run Go Unit Tests') {
            steps {
                dir('back_end') {
                    bat 'go test ./tests/... -v'
                }
            }
        }

        stage('Build') {
            parallel {

                stage('Build Project') {
                    steps {
                        dir('back_end') {
                            echo 'BACKEND BUILD STARTED'
                            bat 'go build -o roamio'
                        }
                    }
                }
            }
        }


    }
    post {
        always {
            echo 'Pipeline execution completed'
            // Clean up workspace to save disk space
            cleanWs()
        }
        success {
            echo 'All tests passed successfully!'
        }
        failure {
            echo 'Tests failed. Please check the logs for details.'
        }
    }
}
