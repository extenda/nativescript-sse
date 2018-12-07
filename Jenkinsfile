library identifier: 'pipeline-library', changelog: false

configuration {
  slack = 'extenda-pixney'
  email = false
}

// The node label
def label = 'ecs-android-tns'

// Set credentials to allow npm to publish to the Nexus registry
def npmrc() {
  withCredentials([string(credentialsId: 'nexus-npm-token', variable: 'NEXUS_TOKEN')]) {
    sh """cat <<EOT >> ~/.npmrc
    email = jenkins@extenda.com
    _auth = $NEXUS_TOKEN
    always-auth = true
    EOT
    """
  }
}

buildProject {
  node(label) {
    stage('lint') {
      checkout scm
      npmrc()
      dir('src') {
        // Store the project version for release process.
        def pkg = readJSON file: 'package.json'
        env.PROJECT_VERSION = pkg['version']

        sh 'npm run ci.tslint'
      }
    }
    stage('build') {
      dir('src') {
        // We build this to make sure the demos build properly.
        sh 'npm run plugin.prepare'
      }
    }
    // Here, we consider the build a success.
    notification 'success'
  }

  if (branch('master')) {
    releaseProject([timeout: 30, noSnapshot: true]) { releaseVersion, developmentVersion ->
      node(label) {
        sh "git config --global credential.helper 'cache --timeout=3600'"
        checkout scm
        npmrc()
        dir('src') {
          sh """
          npm --allow-same-version --no-git-tag-version version $releaseVersion
          git add package.json
          git commit -m "[pipeline committer] prepare release $releaseVersion"
          git tag -a -m "Release $releaseVersion" v$releaseVersion
          npm run plugin.prepare
          """
        }

        dir('publish') {
          sh './publish.sh'
        }

        // Push changes
        sh 'git push $(git remote get-url origin) --follow-tags'
      }
    }
  }
}