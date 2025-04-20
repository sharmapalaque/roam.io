pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Run Go Unit Tests') {
            steps {
                dir('back_end') {
                    bat 'go test ./tests/... -v'
                }
            }
        }
    }
}
